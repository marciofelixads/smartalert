const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AlertController {
    // Create alert
    async create(req, res) {
        try {
            const {
                clientName, clientPhone, type, message, sendDate,
                aiGenerated, aiTone,
                priority, recurrence, recurrenceDays, recurrenceEnd, autoRetry, maxRetries
            } = req.body;

            const sendDateTime = new Date(sendDate);

            const alert = await prisma.alert.create({
                data: {
                    userId: req.user.id,
                    clientName,
                    clientPhone,
                    type,
                    message,
                    sendDate: sendDateTime,
                    priority: priority || 'medium',
                    aiGenerated: aiGenerated || false,
                    aiTone: aiTone || null,
                    recurrence: recurrence || 'once',
                    recurrenceDays: recurrenceDays ? parseInt(recurrenceDays) : null,
                    recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : null,
                    nextSendDate: recurrence && recurrence !== 'once' ? sendDateTime : null,
                    autoRetry: autoRetry !== undefined ? autoRetry : true,
                    maxRetries: maxRetries ? parseInt(maxRetries) : 2
                }
            });

            // Create log entry
            await prisma.alertLog.create({
                data: {
                    alertId: alert.id,
                    userId: req.user.id,
                    action: 'created',
                    details: `Alert created for ${clientName} [${priority || 'medium'}] [${recurrence || 'once'}]`,
                    phone: clientPhone
                }
            });

            return res.status(201).json({ alert });
        } catch (error) {
            console.error('Create alert error:', error);
            return res.status(500).json({ error: 'Failed to create alert' });
        }
    }

    // List alerts for user
    async list(req, res) {
        try {
            const { status, type, search } = req.query;

            const where = { userId: req.user.id };
            if (status) where.status = status;
            if (type) where.type = type;
            if (search) {
                where.OR = [
                    { clientName: { contains: search, mode: 'insensitive' } },
                    { clientPhone: { contains: search } }
                ];
            }

            const alerts = await prisma.alert.findMany({
                where,
                orderBy: { sendDate: 'asc' },
                include: { logs: { orderBy: { createdAt: 'desc' }, take: 1 } }
            });

            return res.json({ alerts });
        } catch (error) {
            console.error('List alerts error:', error);
            return res.status(500).json({ error: 'Failed to list alerts' });
        }
    }

    // Get single alert
    async get(req, res) {
        try {
            const alert = await prisma.alert.findFirst({
                where: { id: parseInt(req.params.id), userId: req.user.id },
                include: { logs: { orderBy: { createdAt: 'desc' } } }
            });

            if (!alert) return res.status(404).json({ error: 'Alert not found' });

            return res.json({ alert });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to get alert' });
        }
    }

    // Update alert
    async update(req, res) {
        try {
            const { clientName, clientPhone, type, message, sendDate, status } = req.body;

            const existing = await prisma.alert.findFirst({
                where: { id: parseInt(req.params.id), userId: req.user.id }
            });
            if (!existing) return res.status(404).json({ error: 'Alert not found' });

            const alert = await prisma.alert.update({
                where: { id: parseInt(req.params.id) },
                data: {
                    ...(clientName && { clientName }),
                    ...(clientPhone && { clientPhone }),
                    ...(type && { type }),
                    ...(message && { message }),
                    ...(sendDate && { sendDate: new Date(sendDate) }),
                    ...(status && { status })
                }
            });

            await prisma.alertLog.create({
                data: {
                    alertId: alert.id,
                    userId: req.user.id,
                    action: 'updated',
                    details: status ? `Status changed to ${status}` : 'Alert updated'
                }
            });

            return res.json({ alert });
        } catch (error) {
            console.error('Update alert error:', error);
            return res.status(500).json({ error: 'Failed to update alert' });
        }
    }

    // Delete alert
    async delete(req, res) {
        try {
            const existing = await prisma.alert.findFirst({
                where: { id: parseInt(req.params.id), userId: req.user.id }
            });
            if (!existing) return res.status(404).json({ error: 'Alert not found' });

            // Delete logs first
            await prisma.alertLog.deleteMany({ where: { alertId: parseInt(req.params.id) } });
            await prisma.alert.delete({ where: { id: parseInt(req.params.id) } });

            return res.json({ message: 'Alert deleted' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete alert' });
        }
    }

    // Dashboard stats (Executive version)
    async stats(req, res) {
        try {
            const userId = req.user.id;
            const now = new Date();
            const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

            const [active, upcoming, sentToday, totalSent, failed, repliedLogs, readLogs, priorityGroups] = await Promise.all([
                prisma.alert.count({ where: { userId, status: 'scheduled' } }),
                prisma.alert.count({ where: { userId, status: 'scheduled', sendDate: { gte: now, lte: in7Days } } }),
                prisma.alert.count({ where: { userId, status: 'sent', updatedAt: { gte: todayStart, lt: todayEnd } } }),
                prisma.alert.count({ where: { userId, status: 'sent' } }),
                prisma.alert.count({ where: { userId, status: 'failed' } }),
                // Response tracking
                prisma.alertLog.count({ where: { userId, action: 'response' } }),
                prisma.alertLog.count({ where: { userId, action: 'read' } }),
                // Priority distribution
                prisma.alert.groupBy({
                    by: ['priority'],
                    where: { userId, status: 'scheduled' },
                    _count: true
                })
            ]);

            const deliveryRate = totalSent + failed > 0
                ? Math.round((totalSent / (totalSent + failed)) * 100)
                : 100;

            const responseRate = totalSent > 0
                ? Math.round((repliedLogs / totalSent) * 100)
                : 0;

            // Calculate Customer Trust Score (0-100)
            // Rule: Start 100, -10 per fail, +15 per response/read (capped)
            const baseScore = 80; // Start with healthy base
            const scorePenalty = failed * 10;
            const scoreBonus = (repliedLogs + readLogs) * 15;
            const customerScore = Math.min(100, Math.max(0, baseScore - scorePenalty + scoreBonus));

            // Map priority groups to a cleaner object
            const priorities = { urgent: 0, high: 0, medium: 0, low: 0 };
            priorityGroups.forEach(g => {
                priorities[g.priority] = g._count;
            });

            return res.json({
                activeAlerts: active,
                next7Days: upcoming,
                sentToday,
                deliveryRate,
                responseRate,
                customerScore,
                priorities
            });
        } catch (error) {
            console.error('Stats error:', error);
            return res.status(500).json({ error: 'Failed to get stats' });
        }
    }

    // Logs for dashboard
    async logs(req, res) {
        try {
            const logs = await prisma.alertLog.findMany({
                where: { userId: req.user.id },
                orderBy: { createdAt: 'desc' },
                take: 50,
                include: { alert: { select: { clientName: true, clientPhone: true, type: true } } }
            });

            return res.json({ logs });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to get logs' });
        }
    }

    // Get detailed logs for a specific alert (Timeline)
    async getAlertLogs(req, res) {
        try {
            const { id } = req.params;
            const logs = await prisma.alertLog.findMany({
                where: { alertId: parseInt(id), userId: req.user.id },
                orderBy: { createdAt: 'desc' }
            });
            return res.json({ logs });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch alert logs' });
        }
    }
}

module.exports = new AlertController();
