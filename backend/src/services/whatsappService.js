class WhatsAppService {
    async sendNotification(user, invoice) {
        const isProduction = process.env.APP_ENV === 'production';

        // 1️⃣ MODE: Simulated (Default for Portfolios/GitHub)
        console.log('--- WHATSAPP SIMULATION ---');
        console.log(`To: ${user.name}`);
        console.log(`Message: New invoice "${invoice.title}" for ${invoice.amount} created!`);
        console.log('---------------------------');

        // 2️⃣ MODE: Real (Commented example for recruitment showcase)
        /*
        if (isProduction) {
          // Example with Twilio or Evolution API
          // const axios = require('axios');
          // await axios.post(process.env.WHATSAPP_API_URL, {
          //   number: user.phone,
          //   message: `Invoice created: ${invoice.title}`,
          //   apikey: process.env.WHATSAPP_API_KEY
          // });
        }
        */

        return { success: true, simulated: true };
    }
}

module.exports = new WhatsAppService();
