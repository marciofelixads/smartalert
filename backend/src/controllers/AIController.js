const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();
const { decrypt } = require('../utils/encryption');


class AIController {
    async generate(req, res) {
        try {
            const userId = req.user.id;
            const { prompt, context } = req.body;

            // 1. Get user AI settings
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    aiProvider: true,
                    aiApiKey: true,
                    aiModel: true,
                    name: true
                }
            });

            if (!user.aiApiKey || !user.aiProvider) {
                return res.status(400).json({
                    error: 'AI not configured. Please go to Settings to set up your AI Provider and API Key.'
                });
            }

            const apiKey = decrypt(user.aiApiKey);
            if (!apiKey) {
                return res.status(500).json({ error: 'Failed to decrypt AI key.' });
            }

            // Diagnostic log (masked key)
            console.log(`🤖 AI Generate for ${user.name}: Provider=${user.aiProvider}, Model=${user.aiModel}, Key=${apiKey.substring(0, 8)}...`);

            const provider = user.aiProvider.toLowerCase();
            const model = user.aiModel || (provider === 'openai' ? 'gpt-4o' : provider === 'gemini' ? 'gemini-2.5-flash' : 'llama-3.3-70b');

            // 2. Construct System Prompt — respects user language and context
            const lang = context.language || 'pt';
            const hasLink = context.attachmentUrl && context.attachmentUrl.trim() !== '';
            const hasDate = context.scheduledDate && context.scheduledDate.trim() !== '';

            const langInstruction = lang === 'pt'
                ? 'Você DEVE responder INTEIRAMENTE em Português do Brasil. Nunca use inglês.'
                : 'You MUST respond ENTIRELY in English. Never use Portuguese.';

            const linkInstruction = hasLink
                ? (lang === 'pt'
                    ? `O usuário forneceu este link/anexo: ${context.attachmentUrl} — inclua naturalmente na mensagem.`
                    : `The user provided this link/attachment: ${context.attachmentUrl} — include it naturally in the message.`)
                : (lang === 'pt'
                    ? 'O usuário NÃO forneceu nenhum link ou anexo. NÃO invente links, NÃO use placeholders como [LINK], [URL], [LINK DE PAGAMENTO] ou similares. Apenas escreva a mensagem sem referência a links.'
                    : 'The user did NOT provide any link or attachment. DO NOT invent links, DO NOT use placeholders like [LINK], [URL], [PAYMENT LINK] or similar. Just write the message without link references.');

            const dateInstruction = hasDate
                ? (lang === 'pt'
                    ? `A data agendada é: ${context.scheduledDate}. Pode mencionar a data naturalmente se fizer sentido.`
                    : `The scheduled date is: ${context.scheduledDate}. You may mention the date naturally if it makes sense.`)
                : (lang === 'pt'
                    ? 'Nenhuma data específica foi informada. NÃO use placeholders como [DATA], [DIA] ou similares.'
                    : 'No specific date was provided. DO NOT use placeholders like [DATE], [DAY] or similar.');

            const systemPrompt = `${langInstruction}

You are an expert in customer relations and WhatsApp communication.
Your goal is to create professional, humanized, and highly effective WhatsApp alert messages.

Context:
- Client Name: ${context.clientName || (lang === 'pt' ? 'o cliente' : 'the client')}
- Alert Type: ${context.alertType || 'general'}
- Tone: ${context.tone || 'friendly'}
- Sender Name: ${user.name}

${linkInstruction}
${dateInstruction}

Rules:
- Use emojis sparingly and strategically (2-3 max).
- Keep it concise (WhatsApp style, max 4-5 lines).
- Be empathetic and clear.
- NEVER use brackets [] for placeholder content. Only include real information.
- NEVER invent information that wasn't provided.
- Focus on the goal: ${context.alertType}.

Respond ONLY with the message text, no explanations or extra formatting.`;

            const fullPrompt = `Based on these instructions: "${prompt}", generate the message.`;

            let generatedText = '';

            // 3. Call AI Provider
            if (provider === 'openai' || provider === 'groq') {
                const baseUrl = provider === 'openai' ? 'https://api.openai.com/v1' : 'https://api.groq.com/openai/v1';
                const response = await axios.post(`${baseUrl}/chat/completions`, {
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: fullPrompt }
                    ],
                    temperature: 0.7
                }, {
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });
                generatedText = response.data.choices[0].message.content;
            }
            else if (provider === 'gemini') {
                const response = await axios.post(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
                    contents: [{
                        parts: [{ text: `${systemPrompt}\n\n${fullPrompt}` }]
                    }]
                });
                generatedText = response.data.candidates[0].content.parts[0].text;
            }

            return res.json({ message: generatedText.trim() });

        } catch (error) {
            const errorMsg = error.response?.data?.error?.message || error.message;
            console.error('AI Generation Error:', errorMsg);
            return res.status(500).json({
                error: `AI Error: ${errorMsg}`
            });
        }
    }
}

module.exports = new AIController();
