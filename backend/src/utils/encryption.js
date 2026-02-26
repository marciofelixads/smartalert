const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY = process.env.ENCRYPTION_KEY; // Must be 32 bytes

/**
 * Encrypts a string using AES-256-CBC
 * @param {string} text 
 * @returns {string} iv:encryptedData
 */
function encrypt(text) {
    if (!text) return null;
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('Encryption Error:', error);
        throw new Error('Falha ao proteger dados sensíveis');
    }
}

/**
 * Decrypts a string using AES-256-CBC
 * @param {string} text iv:encryptedData
 * @returns {string}
 */
function decrypt(text) {
    if (!text) return null;
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption Error:', error);
        return null;
    }
}

module.exports = { encrypt, decrypt };
