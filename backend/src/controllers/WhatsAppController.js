const prisma = require('../config/prisma');
const MetaService = require('../services/MetaService');
const { encrypt, decrypt } = require('../utils/encryption');

class WhatsAppController {
    /**
     * Step 1: Redirect user to Meta OAuth Dialog
     */
    async authLogin(req, res) {
        const appId = process.env.META_APP_ID;
        const redirectUri = encodeURIComponent(process.env.META_REDIRECT_URI);
        const state = req.user.id; // Passing userId as state for security and tracking

        // Scope definitions — read from .env for easy configuration
        const scope = process.env.META_SCOPES || 'whatsapp_business_messaging,whatsapp_business_management';

        const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

        return res.json({ url });
    }

    /**
     * Step 2: Handle OAuth Callback from Meta
     */
    async authCallback(req, res) {
        const { code, state } = req.query;
        console.log('📬 Received Meta callback:', { code: code ? 'provided' : 'missing', state });
        if (!code) return res.status(400).json({ error: 'Code not provided' });

        try {
            const userId = parseInt(state);
            console.log('🔄 Exchanging code for token for user:', userId);

            const shortToken = await MetaService.getAccessTokenFromCode(code);
            const longToken = await MetaService.getLongLivedToken(shortToken);

            let wabaId = null;
            let phoneId = null;
            let isPartialResponse = false;

            try {
                const details = await MetaService.getAccountDetails(longToken);
                wabaId = details.wabaId;
                phoneId = details.phoneId;
                console.log('✅ Account details retrieved:', { wabaId, phoneId });
            } catch (discoveryError) {
                console.warn('⚠️ Auto-discovery failed. Token was acquired. Details:', discoveryError.message);
                isPartialResponse = true;
            }

            const encryptedToken = encrypt(longToken);

            await prisma.user.update({
                where: { id: userId },
                data: {
                    whatsappPhoneNumberId: phoneId,
                    whatsappWabaId: wabaId,
                    whatsappToken: encryptedToken
                }
            });
            console.log('🚀 Database updated for user:', userId);

            if (isPartialResponse) {
                return res.send(`
                    <script>
                        if (window.opener) {
                            window.opener.postMessage({ type: 'wa-auth-partial', message: 'Token obtido! Por favor, insira o Phone ID manualmente no painel.' }, '*');
                        }
                        window.close();
                    </script>
                `);
            }


            // Return a success script that notifies the parent and closes the popup
            return res.send(`
                <script>
                    if (window.opener) {
                        window.opener.postMessage({ type: 'wa-auth-success' }, '*');
                    }
                    window.close();
                </script>
            `);
        } catch (error) {
            console.error('❌ OAuth Callback Error:', error.message);

            let userMessage = error.message;
            if (error.message.includes('whatsapp_business_accounts')) {
                userMessage = 'O seu App na Meta não é do tipo "Business" ou não tem as permissões corretas. Por favor, use a Configuração Manual no painel.';
            }

            return res.send(`
                <script>
                    if (window.opener) {
                        window.opener.postMessage({ type: 'wa-auth-error', message: '${userMessage}' }, '*');
                    }
                    window.close();
                </script>
            `);
        }
    }
    /**
     * Get WhatsApp connection status (Official API)
     */
    async status(req, res) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id }
            });

            const isConfigured = !!user.whatsappToken; // Consider connected if token exists (so user can fill IDs manually)

            return res.json({
                connected: isConfigured,
                provider: 'official',
                config: {
                    phoneNumberId: user.whatsappPhoneNumberId || null,
                    wabaId: user.whatsappWabaId || null,
                    hasToken: !!user.whatsappToken
                }
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao verificar status' });
        }
    }

    /**
     * Send message using Official API
     */
    async sendMessage(req, res) {
        try {
            const { phone, message } = req.body;
            const user = await prisma.user.findUnique({ where: { id: req.user.id } });

            if (!user.whatsappToken) {
                return res.status(400).json({ error: 'WhatsApp não configurado' });
            }

            // Decrypt token on-the-fly (Middleware style)
            const decryptedToken = decrypt(user.whatsappToken);

            const result = await MetaService.sendMessage(
                user.whatsappPhoneNumberId,
                decryptedToken,
                phone,
                message
            );

            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Save configuration manually
     */
    async saveConfig(req, res) {
        try {
            const { phoneNumberId, wabaId, token } = req.body;

            if (!phoneNumberId || !token) {
                return res.status(400).json({ error: 'Phone Number ID and Token are required' });
            }

            const encryptedToken = encrypt(token);

            await prisma.user.update({
                where: { id: req.user.id },
                data: {
                    whatsappPhoneNumberId: phoneNumberId,
                    whatsappWabaId: wabaId || null,
                    whatsappToken: encryptedToken
                }
            });

            return res.json({ success: true, message: 'Configuração salva com sucesso' });
        } catch (error) {
            console.error('Save WhatsApp Config Error:', error);
            return res.status(500).json({ error: 'Falha ao salvar configuração' });
        }
    }

    /**
     * Delete configuration
     */
    async deleteConfig(req, res) {
        try {
            await prisma.user.update({
                where: { id: req.user.id },
                data: {
                    whatsappPhoneNumberId: null,
                    whatsappWabaId: null,
                    whatsappToken: null
                }
            });
            return res.json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Falha ao remover configuração' });
        }
    }

    // --- Outras rotas antigas mantidas para retrocompatibilidade se necessário, ou removidas ---
    async createInstance(req, res) { return res.status(400).json({ error: 'Use a API Oficial' }); }
    async getQrCode(req, res) { return res.status(400).json({ error: 'QR Code não disponível na API Oficial' }); }
    async connectionState(req, res) { return this.status(req, res); }
    async logout(req, res) { return this.deleteConfig(req, res); }
    async deleteInstance(req, res) { return this.deleteConfig(req, res); }
}

module.exports = new WhatsAppController();
