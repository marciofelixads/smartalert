const axios = require('axios');

class MetaService {
    constructor() {
        this.baseUrl = 'https://graph.facebook.com/v19.0';
        this.appId = process.env.META_APP_ID;
        this.appSecret = process.env.META_APP_SECRET;
        this.redirectUri = process.env.META_REDIRECT_URI;
    }

    /**
     * Step 1: Exchange temporary code for an Access Token
     */
    async getAccessTokenFromCode(code) {
        try {
            const response = await axios.get(`${this.baseUrl}/oauth/access_token`, {
                params: {
                    client_id: this.appId,
                    client_secret: this.appSecret,
                    redirect_uri: this.redirectUri,
                    code
                }
            });
            return response.data.access_token;
        } catch (error) {
            console.error('❌ Meta OAuth Token Error:', error.response?.data || error.message);
            throw new Error('Falha ao obter token da Meta');
        }
    }

    /**
     * Step 2: Get Long-Lived Token (60 days)
     */
    async getLongLivedToken(shortToken) {
        try {
            const response = await axios.get(`${this.baseUrl}/oauth/access_token`, {
                params: {
                    grant_type: 'fb_exchange_token',
                    client_id: this.appId,
                    client_secret: this.appSecret,
                    fb_exchange_token: shortToken
                }
            });
            return response.data.access_token;
        } catch (error) {
            console.error('❌ Meta LLT Error:', error.response?.data || error.message);
            return shortToken; // Fallback to short token
        }
    }

    /**
     * Step 3: Discovery - Automatically find WABA IDs and Phone IDs
     */
    async getAccountDetails(token) {
        try {
            // Get user's business accounts
            const bizRes = await axios.get(`${this.baseUrl}/me/whatsapp_business_accounts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const wabaId = bizRes.data.data?.[0]?.id;
            if (!wabaId) throw new Error('Nenhuma conta WhatsApp Business encontrada');

            // Get phone numbers for this WABA
            const phoneRes = await axios.get(`${this.baseUrl}/${wabaId}/phone_numbers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const phoneId = phoneRes.data.data?.[0]?.id;
            if (!phoneId) throw new Error('Nenhum número de telefone encontrado na conta');

            return { wabaId, phoneId };
        } catch (error) {
            console.error('❌ Meta Discovery Error:', error.response?.data || error.message);
            throw new Error('Falha ao descobrir dados da sua conta WhatsApp');
        }
    }

    /**
     * Send a text message using Meta Cloud API
     */
    async sendMessage(phoneNumberId, token, to, text) {
        const formattedPhone = to.replace(/\D/g, '');
        try {
            const response = await axios.post(
                `${this.baseUrl}/${phoneNumberId}/messages`,
                {
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: formattedPhone,
                    type: "text",
                    text: { preview_url: false, body: text }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return { success: true, messageId: response.data?.messages?.[0]?.id };
        } catch (error) {
            console.error('❌ Meta Send Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.message || 'Falha no envio via Meta API');
        }
    }

    /**
     * Send a template message (required for business-initiated if outside 24h)
     */
    async sendTemplate(phoneNumberId, token, to, templateName, languageCode = 'pt_BR', components = []) {
        try {
            const formattedPhone = to.replace(/\D/g, '');

            const response = await axios.post(
                `${this.baseUrl}/${phoneNumberId}/messages`,
                {
                    messaging_product: "whatsapp",
                    to: formattedPhone,
                    type: "template",
                    template: {
                        name: templateName,
                        language: { code: languageCode },
                        components: components
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                messageId: response.data?.messages?.[0]?.id
            };
        } catch (error) {
            console.error('❌ Meta API Template Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.message || 'Falha ao enviar Template via Meta API');
        }
    }
}

module.exports = new MetaService();
