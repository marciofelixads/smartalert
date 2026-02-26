const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const AlertController = require('../controllers/AlertController');
const WhatsAppController = require('../controllers/WhatsAppController');
const WebhookController = require('../controllers/WebhookController');
const AIController = require('../controllers/AIController');
const authMiddleware = require('../middlewares/auth.middleware');

// ── Auth ──
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authMiddleware, AuthController.me);
router.put('/auth/profile', authMiddleware, AuthController.updateProfile);
router.put('/auth/avatar', authMiddleware, AuthController.upload.single('avatar'), AuthController.updateAvatar);

router.post('/auth/ai-key', authMiddleware, AuthController.saveAiKey);
router.delete('/auth/ai-key', authMiddleware, AuthController.removeAiKey);

// ── AI Advanced ──
router.post('/ai/generate', authMiddleware, AIController.generate);

// ── Alerts ──
router.post('/alerts', authMiddleware, AlertController.create);
router.get('/alerts', authMiddleware, AlertController.list);
router.get('/alerts/stats', authMiddleware, AlertController.stats);
router.get('/alerts/logs', authMiddleware, AlertController.logs);
router.get('/alerts/:id/logs', authMiddleware, AlertController.getAlertLogs);
router.get('/alerts/:id', authMiddleware, AlertController.get);
router.put('/alerts/:id', authMiddleware, AlertController.update);
router.delete('/alerts/:id', authMiddleware, AlertController.delete);

// ── WhatsApp (Official API & OAuth) ──
router.get('/whatsapp/status', authMiddleware, WhatsAppController.status);
router.get('/whatsapp/auth/login', authMiddleware, WhatsAppController.authLogin);
router.get('/whatsapp/auth/callback', WhatsAppController.authCallback);
router.post('/whatsapp/config', authMiddleware, WhatsAppController.saveConfig);
router.post('/whatsapp/send', authMiddleware, WhatsAppController.sendMessage);
router.delete('/whatsapp/config', authMiddleware, WhatsAppController.deleteConfig);

// ── Webhooks (no auth - called by Meta/WhatsApp API) ──
router.get('/webhook/whatsapp', WebhookController.verifyWebhook);
router.post('/webhook/whatsapp', WebhookController.handleEvent);
router.post('/webhook/evolution', WebhookController.handleEvent); // keeping for backward stability during migration

module.exports = router;
