const en = require('../i18n/en.json');
const pt = require('../i18n/pt.json');

const translations = { en, pt };

const i18nMiddleware = (req, res, next) => {
    const headerLang = req.headers['accept-language']?.split(',')[0]?.startsWith('pt') ? 'pt' : 'en';
    const lang = req.user?.language || headerLang || 'en';

    req.t = (key) => {
        const set = translations[lang] || translations['en'];
        return set[key] || translations['en'][key] || key;
    };

    next();
};

module.exports = i18nMiddleware;
