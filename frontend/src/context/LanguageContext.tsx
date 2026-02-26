import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../i18n/en.ts';
import { pt } from '../i18n/pt.ts';

type Language = 'en' | 'pt';

interface LanguageContextType {
    language: Language;
    t: (key: keyof typeof en) => string;
    setLanguage: (lang: Language) => void;
}

const translations = { en, pt };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Detecta idioma do navegador como fallback imediato
    const getInitialLang = (): Language => {
        const saved = localStorage.getItem('smart_invoice_lang') as Language;
        if (saved) return saved;

        // Priority default set to English for international markets
        return 'en';
    };

    const [language, setLanguage] = useState<Language>(getInitialLang);

    useEffect(() => {
        // IP detection removed to prevent ERR_NAME_NOT_RESOLVED
        // Browser detection in getInitialLang is sufficient
    }, []);

    // Quando o usuário muda o idioma manualmente (ex: pelo seletor)
    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('smart_invoice_lang', lang);
        localStorage.setItem('smart_invoice_lang_manual', 'true');
    };

    useEffect(() => {
        localStorage.setItem('smart_invoice_lang', language);
    }, [language]);


    const t = (key: keyof typeof en) => {
        // @ts-ignore
        return translations[language][key] || translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, t, setLanguage: handleSetLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};
