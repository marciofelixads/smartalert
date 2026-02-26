require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');

// Ensure uploads dir exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const apiRoutes = require('./src/routes/api');
const i18nMiddleware = require('./src/middlewares/i18n.middleware');
const alertCronJob = require('./src/jobs/AlertCronJob');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(i18nMiddleware);
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', apiRoutes);

// Root - Beautiful Landing Page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SmartAlert API | Sistema Ativo</title>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
            <style>
                :root {
                    --bg: #0f172a;
                    --primary: #3b82f6;
                    --secondary: #6366f1;
                    --text: #f8fafc;
                    --accent: #10b981;
                }
                body {
                    background: var(--bg);
                    color: var(--text);
                    font-family: 'Outfit', sans-serif;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    overflow: hidden;
                }
                .container {
                    text-align: center;
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(10px);
                    padding: 3rem;
                    border-radius: 24px;
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                    max-width: 500px;
                    width: 90%;
                    animation: fadeIn 0.8s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .logo {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }
                h1 {
                    margin: 0;
                    font-size: 2.2rem;
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                p {
                    color: #94a3b8;
                    margin-top: 1rem;
                    font-size: 1.1rem;
                }
                .status {
                    display: inline-flex;
                    align-items: center;
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--accent);
                    padding: 0.5rem 1rem;
                    border-radius: 99px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-top: 2rem;
                }
                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: var(--accent);
                    border-radius: 50%;
                    margin-right: 8px;
                    box-shadow: 0 0 10px var(--accent);
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.4; }
                    100% { opacity: 1; }
                }
                .version {
                    margin-top: 2rem;
                    font-size: 0.8rem;
                    color: #475569;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">⚡</div>
                <h1>SmartAlert API</h1>
                <p>O coração inteligente do seu sistema de notificações via WhatsApp está pulsando.</p>
                <div class="status">
                    <div class="status-dot"></div>
                    SISTEMA OPERACIONAL
                </div>
                <div class="version">Versão 2.4.0 • Meta Official API v19.0</div>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`⚡ SmartAlert API running on port ${PORT}`);
    // Start the alert sending cron job
    alertCronJob.start();
});
