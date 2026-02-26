const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

const metaService = require('../services/MetaService');
const { decrypt } = require('../utils/encryption');

class AlertCronJob {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
        this.retryIntervalId = null;
        this.recurrenceIntervalId = null;
        this.followUpIntervalId = null;

        this.CHECK_INTERVAL = 60 * 1000;        // 60s
        this.RETRY_INTERVAL = 5 * 60 * 1000;    // 5min
        this.RECURRENCE_INTERVAL = 60 * 1000;   // 60s
        this.FOLLOW_UP_INTERVAL = 10 * 60 * 1000; // 10min
    }

    start() {
        console.log('⏰ AlertCronJob started (Meta Official API Mode)');
        this.processAlerts();
        this.intervalId = setInterval(() => this.processAlerts(), this.CHECK_INTERVAL);
        this.retryIntervalId = setInterval(() => this.processRetries(), this.RETRY_INTERVAL);
        this.recurrenceIntervalId = setInterval(() => this.processRecurrence(), this.RECURRENCE_INTERVAL);
        this.followUpIntervalId = setInterval(() => this.processFollowUps(), this.FOLLOW_UP_INTERVAL);
    }

    stop() {
        if (this.intervalId) clearInterval(this.intervalId);
        if (this.retryIntervalId) clearInterval(this.retryIntervalId);
        if (this.recurrenceIntervalId) clearInterval(this.recurrenceIntervalId);
        if (this.followUpIntervalId) clearInterval(this.followUpIntervalId);
        console.log('⏰ AlertCronJob stopped');
    }

    async processAlerts() {
        if (this.isRunning) return;
        this.isRunning = true;
        try {
            const now = new Date();
            const alerts = await prisma.alert.findMany({
                where: { status: 'scheduled', sendDate: { lte: now } },
                include: { user: true },
                take: 50
            });
            if (alerts.length === 0) { this.isRunning = false; return; }
            for (const alert of alerts) {
                try {
                    await this.sendAlert(alert);
                } catch (err) {
                    await this.markFailed(alert, err.message);
                }
            }
        } catch (err) { console.error('❌ AlertCronJob error:', err.message); }
        finally { this.isRunning = false; }
    }

    async processRetries() {
        try {
            const failedAlerts = await prisma.alert.findMany({
                where: { status: 'failed', autoRetry: true },
                take: 20
            });
            const retriable = failedAlerts.filter(a => a.retryCount < a.maxRetries);
            for (const alert of retriable) {
                await prisma.alert.update({
                    where: { id: alert.id },
                    data: { status: 'scheduled', retryCount: alert.retryCount + 1 }
                });
                await prisma.alertLog.create({
                    data: {
                        alertId: alert.id, userId: alert.userId,
                        action: 'retried', details: `Auto-retry #${alert.retryCount + 1}`,
                        phone: alert.clientPhone
                    }
                });
            }
        } catch (err) { }
    }

    async processFollowUps() {
        try {
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            const sentAlerts = await prisma.alert.findMany({
                where: { status: 'sent', updatedAt: { lte: oneDayAgo }, autoRetry: true },
                include: { logs: true, user: true },
                take: 20
            });
            const needsFollowUp = sentAlerts.filter(alert => {
                const hasRead = alert.logs.some(l => l.action === 'read' || l.action === 'replied' || l.action === 'response');
                const hasFollowUp = alert.logs.some(l => l.action === 'retried' && l.details.includes('Follow-up'));
                return !hasRead && !hasFollowUp;
            });
            for (const alert of needsFollowUp) {
                try {
                    const user = alert.user;
                    if (!user.whatsappPhoneNumberId || !user.whatsappToken) continue;
                    const token = decrypt(user.whatsappToken);
                    const followUpMsg = `Lembrete: ${alert.message} (Ainda aguardando seu retorno)`;
                    await metaService.sendMessage(user.whatsappPhoneNumberId, token, alert.clientPhone, `⏳ *FOLLOW-UP*\n\n${followUpMsg}`);
                    await prisma.alertLog.create({
                        data: {
                            alertId: alert.id, userId: alert.userId,
                            action: 'retried', details: 'Follow-up sent (No response in 24h)',
                            phone: alert.clientPhone
                        }
                    });
                } catch (err) { }
            }
        } catch (err) { }
    }

    async processRecurrence() {
        try {
            const sentRecurring = await prisma.alert.findMany({
                where: { status: { in: ['sent', 'delivered', 'read'] }, recurrence: { not: 'once' }, nextSendDate: { not: null } },
                take: 20
            });
            for (const alert of sentRecurring) {
                const nextDate = this.calculateNextDate(alert);
                if (!nextDate) {
                    await prisma.alert.update({ where: { id: alert.id }, data: { nextSendDate: null } });
                    continue;
                }
                const existing = await prisma.alert.findFirst({
                    where: { parentId: alert.parentId || alert.id, sendDate: nextDate, status: 'scheduled' }
                });
                if (existing) {
                    await prisma.alert.update({ where: { id: alert.id }, data: { nextSendDate: null } });
                    continue;
                }
                await prisma.alert.create({
                    data: {
                        userId: alert.userId, clientName: alert.clientName, clientPhone: alert.clientPhone,
                        type: alert.type, message: alert.message, sendDate: nextDate, status: 'scheduled',
                        priority: alert.priority, aiGenerated: alert.aiGenerated, aiTone: alert.aiTone,
                        recurrence: alert.recurrence, recurrenceDays: alert.recurrenceDays, recurrenceEnd: alert.recurrenceEnd,
                        nextSendDate: nextDate, parentId: alert.parentId || alert.id, autoRetry: alert.autoRetry,
                        maxRetries: alert.maxRetries, attachmentUrl: alert.attachmentUrl
                    }
                });
                await prisma.alert.update({ where: { id: alert.id }, data: { nextSendDate: null } });
            }
        } catch (err) { }
    }

    calculateNextDate(alert) {
        const current = new Date(alert.sendDate);
        let next;
        switch (alert.recurrence) {
            case 'daily': next = new Date(current); next.setDate(next.getDate() + 1); break;
            case 'weekly': next = new Date(current); next.setDate(next.getDate() + 7); break;
            case 'monthly': next = new Date(current); next.setMonth(next.getMonth() + 1); break;
            case 'business_days':
                next = new Date(current);
                do { next.setDate(next.getDate() + 1); } while (next.getDay() === 0 || next.getDay() === 6);
                break;
            case 'custom':
                if (!alert.recurrenceDays) return null;
                next = new Date(current); next.setDate(next.getDate() + alert.recurrenceDays); break;
            default: return null;
        }
        if (alert.recurrenceEnd && next > new Date(alert.recurrenceEnd)) return null;
        return next;
    }

    async sendAlert(alert) {
        const user = alert.user;
        if (!user.whatsappPhoneNumberId || !user.whatsappToken) {
            throw new Error('WhatsApp Official API not configured for this user');
        }

        const token = decrypt(user.whatsappToken);
        let messageText = alert.message;
        if (alert.priority === 'urgent') messageText = `🚨 ${messageText}`;
        else if (alert.priority === 'high') messageText = `⚠️ ${messageText}`;

        const result = await metaService.sendMessage(user.whatsappPhoneNumberId, token, alert.clientPhone, messageText);

        await prisma.alert.update({ where: { id: alert.id }, data: { status: 'sent' } });
        await prisma.alertLog.create({
            data: {
                alertId: alert.id, userId: alert.userId,
                action: 'sent', details: `Sent via Meta Official API [${alert.priority}]`,
                phone: alert.clientPhone, messageId: result.messageId
            }
        });
    }

    async markFailed(alert, reason) {
        try {
            await prisma.alert.update({ where: { id: alert.id }, data: { status: 'failed' } });
            await prisma.alertLog.create({
                data: {
                    alertId: alert.id, userId: alert.userId,
                    action: 'failed', details: reason || 'Unknown error',
                    phone: alert.clientPhone
                }
            });
        } catch (err) { }
    }
}

module.exports = new AlertCronJob();
