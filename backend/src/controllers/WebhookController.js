const crypto = require('crypto');
const prisma = require('../config/prisma');

class WebhookController {
    /**
     * Sênior Middleware: Validate X-Hub-Signature-256
     */
    validateSignature(req) {
        const signature = req.headers['x-hub-signature-256'];
        if (!signature) return false;

        const elements = signature.split('=');
        const signatureHash = elements[1];
        const expectedHash = crypto
            .createHmac('sha256', process.env.META_APP_SECRET)
            .update(req.rawBody)
            .digest('hex');

        return signatureHash === expectedHash;
    }

    async verifyWebhook(req, res) {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

        if (mode && token) {
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                return res.status(200).send(challenge);
            }
        }
        return res.status(403).send('Forbidden');
    }

    async handleEvent(req, res) {
        // Essential Security Check
        if (!this.validateSignature(req)) {
            console.warn('⚠️ Webhook Signature mismatch!');
            return res.status(401).send('Signatures did not match');
        }

        try {
            const body = req.body;

            // Check if it's a WhatsApp event
            if (body.object === 'whatsapp_business_account') {
                for (const entry of body.entry) {
                    for (const change of entry.changes) {
                        const value = change.value;
                        const metadata = value.metadata;

                        // Case 1: Status Updates (sent, delivered, read, failed)
                        if (value.statuses) {
                            for (const statusObj of value.statuses) {
                                await this.handleStatusUpdate(statusObj);
                            }
                        }

                        // Case 2: New Messages (Replies)
                        if (value.messages) {
                            for (const msgObj of value.messages) {
                                await this.handleIncomingMessage(msgObj, metadata);
                            }
                        }
                    }
                }
                return res.status(200).send('EVENT_RECEIVED');
            } else {
                return res.status(404).send('Not Found');
            }
        } catch (error) {
            console.error('❌ Webhook error:', error.message);
            return res.status(200).json({ received: true, error: error.message });
        }
    }

    /**
     * Handle delivery status updates (Meta format)
     */
    async handleStatusUpdate(statusObj) {
        const messageId = statusObj.id;
        const status = statusObj.status; // sent, delivered, read, failed
        const recipientId = statusObj.recipient_id;

        const actionMap = {
            'delivered': 'delivered',
            'read': 'read',
            'failed': 'failed'
        };

        const action = actionMap[status];
        if (!action) return;

        // Find the log entry with this messageId
        const existingLog = await prisma.alertLog.findFirst({
            where: { messageId: messageId },
            include: { alert: true }
        });

        if (existingLog) {
            await prisma.alertLog.create({
                data: {
                    alertId: existingLog.alertId,
                    userId: existingLog.userId,
                    action: action,
                    details: `Status: ${status} (Official API)`,
                    phone: recipientId,
                    messageId: messageId
                }
            });

            console.log(`   📬 Msg ${messageId} → ${status} (Log created)`);

            if (status === 'failed') {
                await prisma.alert.update({
                    where: { id: existingLog.alertId },
                    data: { status: 'failed' }
                });
            }
        }
    }

    /**
     * Handle new incoming messages (Customer Response)
     */
    async handleIncomingMessage(msgObj, metadata) {
        const phone = msgObj.from;
        const text = msgObj.text?.body || '[Outro tipo de mensagem]';
        const messageId = msgObj.id;

        // Try to find an alert linked to this phone (match last 8 digits for safety)
        const recentLog = await prisma.alertLog.findFirst({
            where: {
                phone: { contains: phone.slice(-8) },
                action: { in: ['sent', 'delivered', 'read'] }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (recentLog) {
            await prisma.alertLog.create({
                data: {
                    alertId: recentLog.alertId,
                    userId: recentLog.userId,
                    action: 'response',
                    details: `Resposta: "${text.substring(0, 200)}"`,
                    phone: phone,
                    messageId: messageId
                }
            });
            console.log(`   💬 Resposta de ${phone} no alerta #${recentLog.alertId}`);
        }
    }
}

module.exports = new WebhookController();
