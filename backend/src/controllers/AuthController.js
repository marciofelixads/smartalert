const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { encrypt, decrypt } = require('../utils/encryption');

const JWT_SECRET = process.env.JWT_SECRET || 'smartalert_jwt_secret_2026';

function maskKey(key) {
    if (!key || key.length < 8) return '****';
    return key.substring(0, 4) + '****' + key.substring(key.length - 4);
}

function userResponse(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        language: user.language,
        aiProvider: user.aiProvider,
        aiModel: user.aiModel,
        aiApiKey: user.aiApiKey ? maskKey(decrypt(user.aiApiKey)) : null,
        hasAiKey: !!user.aiApiKey,
        avatarUrl: user.avatarUrl
    };
}

const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

class AuthController {
    // profile upload middleware as a property
    get upload() { return upload; }

    async updateAvatar(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const avatarUrl = `/uploads/${req.file.filename}`;

            const updatedUser = await prisma.user.update({
                where: { id: req.user.id },
                data: { avatarUrl }
            });

            return res.json({
                message: 'Avatar updated successfully',
                user: userResponse(updatedUser)
            });
        } catch (error) {
            console.error('Avatar update error:', error);
            return res.status(500).json({ error: req.t('error_occurred') });
        }
    }

    async register(req, res) {
        try {
            const { name, email, password, language } = req.body;

            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: req.t('user_exists') });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: { name, email, password: hashedPassword, language: language || 'en' }
            });

            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

            return res.status(201).json({
                message: req.t('user_registered'),
                user: userResponse(user),
                token
            });
        } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({ error: error.message || req.t('error_occurred') });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(401).json({ error: req.t('auth_failed') });
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({ error: req.t('auth_failed') });
            }

            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

            return res.json({
                message: req.t('auth_success'),
                user: userResponse(user),
                token
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: req.t('error_occurred') });
        }
    }

    async me(req, res) {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        return res.json({ user: userResponse(user) });
    }

    async updateProfile(req, res) {
        try {
            const { name, language } = req.body;
            const updatedUser = await prisma.user.update({
                where: { id: req.user.id },
                data: { name, language }
            });

            return res.json({ user: userResponse(updatedUser) });
        } catch (error) {
            return res.status(500).json({ error: req.t('error_occurred') });
        }
    }

    // AI Key Management
    async saveAiKey(req, res) {
        try {
            const { provider, apiKey, model } = req.body;

            if (!provider || !apiKey) {
                return res.status(400).json({ error: 'Provider and API Key are required' });
            }

            const encryptedKey = encrypt(apiKey);

            const updatedUser = await prisma.user.update({
                where: { id: req.user.id },
                data: {
                    aiProvider: provider,
                    aiApiKey: encryptedKey,
                    aiModel: model || null
                }
            });

            return res.json({
                message: 'AI configuration saved successfully',
                user: userResponse(updatedUser)
            });
        } catch (error) {
            console.error('Save AI key error:', error);
            return res.status(500).json({ error: 'Failed to save AI configuration' });
        }
    }

    async removeAiKey(req, res) {
        try {
            const updatedUser = await prisma.user.update({
                where: { id: req.user.id },
                data: { aiProvider: null, aiApiKey: null, aiModel: null }
            });

            return res.json({
                message: 'AI configuration removed',
                user: userResponse(updatedUser)
            });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to remove AI configuration' });
        }
    }
}

module.exports = new AuthController();
