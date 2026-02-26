import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, User, Save, Bell, Zap, Key,
    Check, Trash2, AlertCircle, ExternalLink, MessageSquare,
    RefreshCw, Send, Shield, Smartphone
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AI_PROVIDERS = [
    {
        id: 'openai', name: 'OpenAI',
        color: '#10a37f', bgColor: 'rgba(16, 163, 127, 0.08)', borderColor: 'rgba(16, 163, 127, 0.2)',
        models: [
            { id: 'gpt-4o', name: 'GPT-4o', desc: 'Mais inteligente' },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Rápido e barato' },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', desc: 'Alta capacidade' },
        ],
        placeholder: 'sk-...', docsUrl: 'https://platform.openai.com/api-keys'
    },
    {
        id: 'gemini', name: 'Google Gemini',
        color: '#4285f4', bgColor: 'rgba(66, 133, 244, 0.08)', borderColor: 'rgba(66, 133, 244, 0.2)',
        models: [
            { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Recomendado' },
            { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Expt)', desc: 'Nova Geração' },
            { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'Rápido' },
            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', desc: 'Avançado' },
        ],
        placeholder: 'AIza...', docsUrl: 'https://aistudio.google.com/apikey'
    },
    {
        id: 'groq', name: 'Groq',
        color: '#f55036', bgColor: 'rgba(245, 80, 54, 0.08)', borderColor: 'rgba(245, 80, 54, 0.2)',
        models: [
            { id: 'llama-3.3-70b-versatile', name: 'LLaMA 3.3 70B', desc: 'Melhor qualidade' },
            { id: 'llama-3.1-8b-instant', name: 'LLaMA 3.1 8B', desc: 'Ultra rápido' },
            { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', desc: 'Balanceado' },
        ],
        placeholder: 'gsk_...', docsUrl: 'https://console.groq.com/keys'
    }
];

const OpenAIIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.998 5.998 0 0 0-3.998 2.9 6.042 6.042 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" fill="currentColor" />
    </svg>
);

const GeminiIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" fill="url(#gemini-gradient)" />
        <defs><linearGradient id="gemini-gradient" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#4285f4" /><stop offset="0.5" stopColor="#9b72cb" /><stop offset="1" stopColor="#d96570" /></linearGradient></defs>
    </svg>
);

const GroqIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#f55036" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="800" fontFamily="Inter">G</text>
    </svg>
);

const providerIcons: Record<string, React.FC> = { openai: OpenAIIcon, gemini: GeminiIcon, groq: GroqIcon };

// WhatsApp SVG icon
const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const Settings: React.FC = () => {
    const { t, language, setLanguage } = useLanguage();
    const { user, updateUser, token } = useAuth();
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('settings_active_tab') || 'profile');
    const [name, setName] = useState(user?.name || '');
    const [success, setSuccess] = useState('');

    // AI State
    const [selectedProvider, setSelectedProvider] = useState(user?.aiProvider || '');
    const [selectedModel, setSelectedModel] = useState(user?.aiModel || '');
    const [apiKey, setApiKey] = useState('');
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // WhatsApp State (Meta Official)
    const [metaPhoneNumberId, setMetaPhoneNumberId] = useState('');
    const [metaWabaId, setMetaWabaId] = useState('');
    const [metaToken, setMetaToken] = useState('');
    const [waConnected, setWaConnected] = useState(false);
    const [waSaving, setWaSaving] = useState(false);
    const [waTestPhone, setWaTestPhone] = useState('');
    const [waTestMsg, setWaTestMsg] = useState('');
    const [waSending, setWaSending] = useState(false);

    // Notifications State
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifDelivery, setNotifDelivery] = useState(true);
    const [notifFailure, setNotifFailure] = useState(true);
    const [notifDaily, setNotifDaily] = useState(false);
    const [notifSound, setNotifSound] = useState(true);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        localStorage.setItem('settings_active_tab', tabId);
    };

    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        headers: { Authorization: `Bearer ${token}` }
    });

    const showSuccess = (msg: string) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3000);
    };

    // ── Profile ──
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.put('/auth/profile', { name, language });
            updateUser(res.data.user);
            showSuccess(t('profile_updated'));
        } catch { alert('Error'); }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await api.put('/auth/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser(res.data.user);
            showSuccess(t('profile_updated'));
        } catch (err) {
            alert(t('error'));
        }
    };

    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

    // ── AI ──
    const handleSaveAiKey = async () => {
        if (!selectedProvider || !apiKey) return;
        setSaving(true);
        try {
            const res = await api.post('/auth/ai-key', { provider: selectedProvider, apiKey, model: selectedModel });
            updateUser(res.data.user);
            setApiKey('');
            setShowKeyModal(false);
            showSuccess(t('ai_key_saved'));
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to save');
        } finally { setSaving(false); }
    };

    const handleRemoveAiKey = async () => {
        try {
            const res = await api.delete('/auth/ai-key');
            updateUser(res.data.user);
            setSelectedProvider('');
            setSelectedModel('');
            showSuccess(t('ai_key_removed'));
        } catch { alert('Error'); }
    };

    const handleSaveNotifications = () => {
        localStorage.setItem('notif_prefs', JSON.stringify({
            email: notifEmail, delivery: notifDelivery, failure: notifFailure, daily: notifDaily, sound: notifSound
        }));
        showSuccess(t('notif_saved'));
    };

    const currentProvider = AI_PROVIDERS.find(p => p.id === (user?.aiProvider || selectedProvider));

    // ── WhatsApp ──
    const fetchWaStatus = useCallback(async () => {
        try {
            const res = await api.get('/whatsapp/status');
            setWaConnected(res.data.connected);
            if (res.data.config) {
                setMetaPhoneNumberId(res.data.config.phoneNumberId || '');
                setMetaWabaId(res.data.config.wabaId || '');
            }
        } catch {
            setWaConnected(false);
        }
    }, [token]);

    useEffect(() => { if (activeTab === 'whatsapp') fetchWaStatus(); }, [activeTab, fetchWaStatus]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'wa-auth-success') {
                showSuccess(t('wa_connected_toast'));
                fetchWaStatus();
            } else if (event.data.type === 'wa-auth-partial') {
                showSuccess('Token obtido! Por favor, informe o seu Phone ID.');
                fetchWaStatus();
                setTimeout(() => {
                    const detailsEl = document.getElementById('manual-config-details');
                    if (detailsEl) detailsEl.setAttribute('open', 'true');
                }, 500);
            } else if (event.data.type === 'wa-auth-error') {
                alert(`${t('error')}: ${event.data.message}`);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [fetchWaStatus]);

    const handleMetaLogin = async () => {
        try {
            const res = await api.get('/whatsapp/auth/login');
            if (res.data.url) {
                // Open professional popup
                const width = 600;
                const height = 700;
                const left = window.screenX + (window.outerWidth - width) / 2;
                const top = window.screenY + (window.outerHeight - height) / 2;

                const authWindow = window.open(
                    res.data.url,
                    'MetaDocsAuth',
                    `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
                );

                // Polling fallback
                const pollTimer = setInterval(() => {
                    if (authWindow?.closed) {
                        clearInterval(pollTimer);
                        fetchWaStatus(); // Atualiza a página suavemente via React state
                        setTimeout(() => {
                            if (!waConnected) {
                                // Se ainda não conectou 100%, é porque precisa dos IDs
                                const detailsEl = document.getElementById('manual-config-details');
                                if (detailsEl) detailsEl.setAttribute('open', 'true');
                            }
                        }, 800);
                    }
                }, 1000);
            }
        } catch {
            alert(t('error'));
        }
    };

    const handleSaveMetaConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setWaSaving(true);
        try {
            await api.post('/whatsapp/config', {
                phoneNumberId: metaPhoneNumberId,
                wabaId: metaWabaId,
                token: metaToken
            });
            setWaConnected(true);
            setMetaToken(''); // clear token for security
            showSuccess(t('wa_config_saved'));
        } catch (err: any) {
            alert(err.response?.data?.error || t('error'));
        } finally {
            setWaSaving(false);
        }
    };

    const handleRemoveConnection = async () => {
        if (!confirm('Tem certeza que deseja remover a configuração?')) return;
        try {
            await api.delete('/whatsapp/config');
            setWaConnected(false);
            setMetaPhoneNumberId('');
            setMetaWabaId('');
            setMetaToken('');
            showSuccess(t('wa_config_removed'));
        } catch { alert(t('error')); }
    };

    const handleSendTest = async () => {
        if (!waTestPhone || !waTestMsg) return;
        setWaSending(true);
        try {
            await api.post('/whatsapp/send', { phone: waTestPhone, message: waTestMsg });
            showSuccess(t('wa_test_sent'));
            setWaTestMsg('');
        } catch { alert(t('wa_test_failed')); }
        finally { setWaSending(false); }
    };

    const tabs = [
        { id: 'profile', label: t('tab_profile'), icon: <User size={15} /> },
        { id: 'ai', label: t('tab_ai'), icon: <Zap size={15} /> },
        { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare size={15} /> },
        { id: 'notifications', label: t('tab_notifications'), icon: <Bell size={15} /> },
    ];

    return (
        <div className="settings-layout">
            <aside className="settings-sidebar">
                <h2 className="title-font">{t('settings')}</h2>
                {tabs.map(tab => (
                    <button key={tab.id} className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => handleTabChange(tab.id)}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </aside>

            <main className="settings-content">
                <AnimatePresence mode="wait">
                    {/* ═══════ PROFILE ═══════ */}
                    {activeTab === 'profile' && (
                        <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="settings-card">
                            <h3>{t('tab_profile')}</h3>
                            <p className="subtitle">{t('profile_desc')}</p>

                            <div className="settings-profile-photo">
                                <div className="settings-avatar-preview">
                                    {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="avatar-img-lg" /> : initials}
                                </div>
                                <div className="photo-actions">
                                    <h4>{t('profile_photo')}</h4>
                                    <p>{t('profile_photo_desc')}</p>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        hidden
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                    />
                                    <button
                                        type="button"
                                        className="btn-upload"
                                        onClick={() => document.getElementById('avatar-upload')?.click()}
                                    >
                                        <RefreshCw size={14} /> {t('change_photo')}
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateProfile}>
                                <div className="input-container">
                                    <label className="label">{t('name')}</label>
                                    <input value={name} onChange={e => setName(e.target.value)} style={{ paddingLeft: '14px' }} />
                                </div>
                                <div className="input-container">
                                    <label className="label">{t('email')}</label>
                                    <input disabled value={user?.email || ''} style={{ paddingLeft: '14px', opacity: 0.5 }} />
                                </div>
                                <div className="input-container">
                                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={13} /> {t('language')}</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button type="button" onClick={() => setLanguage('en')} className={`profile-lang-btn ${language === 'en' ? 'active' : ''}`} style={{ flex: 1 }}><span className="profile-lang-dot"></span> English</button>
                                        <button type="button" onClick={() => setLanguage('pt')} className={`profile-lang-btn ${language === 'pt' ? 'active' : ''}`} style={{ flex: 1 }}><span className="profile-lang-dot"></span> Português</button>
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary" style={{ maxWidth: '200px' }}><Save size={15} /> {t('save')}</button>
                            </form>
                        </motion.div>
                    )}

                    {/* ═══════ AI ═══════ */}
                    {activeTab === 'ai' && (
                        <motion.div key="ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="settings-card">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={18} style={{ color: 'var(--primary)' }} /> {t('ai_configuration')}</h3>
                            <p className="subtitle">{t('ai_config_desc')}</p>

                            {user?.hasAiKey ? (
                                <div className="ai-status-card connected">
                                    <div className="ai-status-header">
                                        <div className="ai-status-icon" style={{ color: currentProvider?.color }}>{currentProvider && providerIcons[currentProvider.id] ? React.createElement(providerIcons[currentProvider.id]) : <Key size={20} />}</div>
                                        <div>
                                            <div className="ai-status-provider">{currentProvider?.name || user.aiProvider}</div>
                                            <div className="ai-status-model">{user.aiModel}</div>
                                            <div className="ai-status-key"><Key size={10} /> {user.aiApiKey}</div>
                                        </div>
                                    </div>
                                    <div className="ai-status-actions">
                                        <button className="ai-change-btn" onClick={() => setShowKeyModal(true)}>{t('change')}</button>
                                        <button className="ai-remove-btn" onClick={handleRemoveAiKey}><Trash2 size={13} /></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="ai-status-card empty"><AlertCircle size={18} style={{ color: 'var(--amber)' }} /><span>{t('no_ai_configured')}</span></div>
                            )}

                            <div style={{ marginTop: '20px' }}>
                                <label className="label">{t('select_provider')}</label>
                                <div className="ai-provider-grid">
                                    {AI_PROVIDERS.map(provider => {
                                        const Icon = providerIcons[provider.id];
                                        return (
                                            <button key={provider.id} className={`ai-provider-card ${selectedProvider === provider.id ? 'active' : ''}`}
                                                style={{ '--provider-color': provider.color, '--provider-bg': provider.bgColor, '--provider-border': provider.borderColor } as React.CSSProperties}
                                                onClick={() => { setSelectedProvider(provider.id); setSelectedModel(provider.models[0].id); setShowKeyModal(true); }}>
                                                <div className="provider-icon-wrap" style={{ color: provider.color }}><Icon /></div>
                                                <div className="provider-name">{provider.name}</div>
                                                <div className="provider-models">{provider.models.length} {t('models')}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══════ WHATSAPP (OFFICIAL) ═══════ */}
                    {activeTab === 'whatsapp' && (
                        <motion.div key="whatsapp" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="settings-card">
                            <div className="wa-header-layout" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div>
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                        <span style={{ color: '#25D366' }}><WhatsAppIcon size={24} /></span> WhatsApp Business
                                    </h3>
                                    <p className="subtitle" style={{ marginTop: '4px' }}>{t('wa_official_platform')}</p>
                                </div>
                                {waConnected && (
                                    <div className="wa-status-badge">
                                        <span className="wa-dot pulse"></span> {t('wa_active_connected')}
                                    </div>
                                )}
                            </div>

                            {!waConnected ? (
                                /* ── ESTADO DESCONECTADO (Splash Screen Profissional) ── */
                                <div className="wa-onboarding-splash" style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.03) 0%, rgba(99, 102, 241, 0.03) 100%)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    marginBottom: '24px'
                                }}>
                                    <div style={{
                                        width: '64px', height: '64px', borderRadius: '20px', background: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                                    }}>
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" width="32" alt="Meta" />
                                    </div>
                                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>{t('wa_connect_business')}</h4>
                                    <p style={{ maxWidth: '440px', margin: '0 auto 24px', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                        {t('wa_connect_desc_long')}
                                    </p>

                                    <button
                                        className="btn-primary"
                                        style={{
                                            background: '#1877F2',
                                            borderColor: '#1877F2',
                                            padding: '12px 32px',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            boxShadow: '0 4px 14px 0 rgba(24, 119, 242, 0.39)',
                                            margin: '0 auto'
                                        }}
                                        onClick={handleMetaLogin}
                                    >
                                        {t('wa_connect_fb')}
                                    </button>

                                    <div style={{ marginTop: '32px', display: 'flex', gap: '32px', justifyContent: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            <Shield size={14} className="text-emerald" /> {t('wa_uptime')}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            <Zap size={14} className="text-primary" /> {t('wa_instant_delivery')}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* ── ESTADO CONECTADO (Dashboard da Conexão Profissional) ── */
                                <div className="wa-connection-dashboard" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                                    <div className="wa-info-card" style={{
                                        background: 'rgba(37, 211, 102, 0.05)',
                                        borderRadius: '16px',
                                        padding: '24px',
                                        border: '1px solid rgba(37, 211, 102, 0.2)',
                                        boxShadow: '0 10px 30px -10px rgba(37, 211, 102, 0.1)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                            <div style={{
                                                width: '56px', height: '56px', borderRadius: '14px',
                                                background: '#25D366',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white',
                                                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
                                            }}>
                                                <Smartphone size={28} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{t('wa_connected_account')}</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#25D366' }}>ID: {metaPhoneNumberId}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                    <Shield size={12} className="text-emerald" />
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>Conexão Segura e Ativa</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                            <div style={{ background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>WABA ID</div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace' }}>{metaWabaId || 'N/A'}</div>
                                            </div>
                                            <div style={{ background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Provedor</div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Meta Cloud API</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button
                                                className="btn-primary"
                                                onClick={() => {
                                                    const detailsEl = document.getElementById('manual-config-details');
                                                    if (detailsEl) {
                                                        detailsEl.setAttribute('open', 'true');
                                                        detailsEl.scrollIntoView({ behavior: 'smooth' });
                                                    }
                                                }}
                                                style={{ flex: 1, fontSize: '0.8rem', padding: '10px' }}
                                            >
                                                <RefreshCw size={14} /> Reconfigurar
                                            </button>
                                            <button className="btn-outline" onClick={handleRemoveConnection} style={{
                                                fontSize: '0.8rem',
                                                padding: '10px',
                                                color: '#f87171',
                                                borderColor: 'rgba(248,113,113,0.2)',
                                                background: 'rgba(248,113,113,0.05)'
                                            }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="wa-webhook-card" style={{ background: 'var(--card-bg)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-color)' }}>
                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '12px' }}>
                                            <Globe size={14} className="text-primary" /> {t('wa_meta_webhook')}
                                        </h4>
                                        <div className="copy-field">
                                            <label>{t('wa_callback_url')}</label>
                                            <input readOnly value={`${import.meta.env.VITE_API_URL}/webhook/whatsapp`} />
                                        </div>
                                        <div className="copy-field">
                                            <label>{t('wa_verify_token')}</label>
                                            <input readOnly value="smartalert_verify_token_2026" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MANUAL CONFIG (Hidden by default for clean UX) */}
                            <details id="manual-config-details" style={{ marginTop: '20px' }}>
                                <summary id="manual-config-toggle" style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '10px 0',
                                    display: 'none'
                                }}>
                                    {t('wa_manual_config')}
                                </summary>

                                <div className="wa-manual-form" style={{ marginTop: '16px', padding: '24px', background: 'rgba(0,0,0,0.15)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                                        <form onSubmit={handleSaveMetaConfig} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                                            <h5 style={{ marginBottom: '5px', fontSize: '0.9rem' }}>{t('wa_dev_credentials')}</h5>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '10px' }}>{t('wa_dev_desc')}</p>

                                            <div className="input-container">
                                                <label className="label">Phone Number ID</label>
                                                <input value={metaPhoneNumberId} onChange={e => setMetaPhoneNumberId(e.target.value)} placeholder="Ex: 1029384756..." required />
                                            </div>
                                            <div className="input-container">
                                                <label className="label">WABA ID</label>
                                                <input value={metaWabaId} onChange={e => setMetaWabaId(e.target.value)} placeholder="Ex: 5647382910..." required />
                                            </div>
                                            <div className="input-container">
                                                <label className="label">Permanent Access Token</label>
                                                <input type="password" placeholder={waConnected ? '••••••••••••••••' : 'EAAG...'} value={metaToken} onChange={e => setMetaToken(e.target.value)} required={!waConnected} />
                                            </div>
                                            <button type="submit" className="btn-primary" disabled={waSaving} style={{ width: '100%', marginTop: '10px' }}>
                                                {waSaving ? <RefreshCw className="spin-animation" size={14} /> : <Save size={14} />}
                                                {t('wa_save_pro')}
                                            </button>
                                        </form>

                                        <div className="wa-guide-steps" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '30px' }}>
                                            <h5 style={{ marginBottom: '15px', fontSize: '0.9rem' }}>{t('wa_guide_title')}</h5>
                                            <div className="guide-step-item" style={{ marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                                                    <p style={{ fontSize: '0.75rem', margin: 0 }}>{t('wa_guide_step1')}</p>
                                                </div>
                                            </div>
                                            <div className="guide-step-item" style={{ marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                                                    <p style={{ fontSize: '0.75rem', margin: 0 }}>{t('wa_guide_step2')}</p>
                                                </div>
                                            </div>
                                            <div className="guide-step-item">
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
                                                    <p style={{ fontSize: '0.75rem', margin: 0 }}>{t('wa_guide_step3')}</p>
                                                </div>
                                            </div>

                                            <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(251,191,36,0.05)', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.1)' }}>
                                                <p style={{ fontSize: '0.65rem', color: 'var(--amber)', margin: 0, display: 'flex', gap: '6px' }}>
                                                    <AlertCircle size={12} /> {t('wa_webhook_hint')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </details>

                            {/* Trigger for Details */}
                            {!waConnected && (
                                <p style={{ fontSize: '0.65rem', textAlign: 'center', marginTop: '16px', color: 'var(--text-muted)' }}>
                                    <span onClick={() => (document.getElementById('manual-config-details') as any).toggleAttribute('open')} style={{ textDecoration: 'underline', cursor: 'pointer', color: 'var(--primary)' }}>{t('wa_manual_guide_trigger')}</span>
                                </p>
                            )}

                            {/* TEST SECTION */}
                            {waConnected && (
                                <div className="wa-test-box" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}><Send size={14} /> {t('wa_validate_connection')}</h4>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('wa_send_test_real')}</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '12px', alignItems: 'flex-end' }}>
                                        <div className="input-container" style={{ marginBottom: 0 }}>
                                            <label className="label">{t('wa_test_phone_label')}</label>
                                            <input placeholder="+55..." value={waTestPhone} onChange={e => setWaTestPhone(e.target.value)} />
                                        </div>
                                        <div className="input-container" style={{ marginBottom: 0 }}>
                                            <label className="label">{t('wa_test_msg_label')}</label>
                                            <input placeholder={t('message')} value={waTestMsg} onChange={e => setWaTestMsg(e.target.value)} />
                                        </div>
                                        <button className="btn-primary" onClick={handleSendTest} disabled={waSending} style={{ padding: '10px 20px' }}>
                                            {waSending ? <RefreshCw className="spin-animation" size={14} /> : <Send size={14} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ═══════ NOTIFICATIONS ═══════ */}
                    {activeTab === 'notifications' && (
                        <motion.div key="notifications" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="settings-card">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Bell size={18} style={{ color: 'var(--primary)' }} /> {t('tab_notifications')}</h3>
                            <p className="subtitle">{t('notifications_desc')}</p>

                            <div className="notif-list">
                                {[
                                    { key: 'email', icon: <Send size={16} />, color: 'var(--primary)', bg: 'rgba(99,102,241,0.1)', val: notifEmail, set: setNotifEmail },
                                    { key: 'delivery', icon: <Check size={16} />, color: 'var(--emerald)', bg: 'rgba(52,211,153,0.1)', val: notifDelivery, set: setNotifDelivery },
                                    { key: 'failure', icon: <AlertCircle size={16} />, color: 'var(--red)', bg: 'rgba(248,113,113,0.1)', val: notifFailure, set: setNotifFailure },
                                    { key: 'daily', icon: <Shield size={16} />, color: 'var(--amber)', bg: 'rgba(251,191,36,0.1)', val: notifDaily, set: setNotifDaily },
                                    { key: 'sound', icon: <Bell size={16} />, color: 'var(--primary)', bg: 'rgba(99,102,241,0.1)', val: notifSound, set: setNotifSound },
                                ].map(n => (
                                    <div className="notif-item" key={n.key}>
                                        <div className="notif-item-content">
                                            <div className="notif-item-icon" style={{ background: n.bg, color: n.color }}>{n.icon}</div>
                                            <div>
                                                <div className="notif-item-title">{t(`notif_${n.key}_title` as any)}</div>
                                                <div className="notif-item-desc">{t(`notif_${n.key}_desc` as any)}</div>
                                            </div>
                                        </div>
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={n.val} onChange={e => n.set(e.target.checked)} />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <button className="btn-primary" onClick={handleSaveNotifications} style={{ maxWidth: '200px', marginTop: '20px' }}>
                                <Save size={15} /> {t('save')}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {success && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="success-toast">
                            <Check size={14} /> {success}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* AI Key Modal */}
            <AnimatePresence>
                {showKeyModal && (
                    <div className="modal-overlay" onClick={() => setShowKeyModal(false)}>
                        <motion.div className="modal-card ai-key-modal" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setShowKeyModal(false)}>&times;</button>
                            {selectedProvider && (() => {
                                const prov = AI_PROVIDERS.find(p => p.id === selectedProvider);
                                const Icon = providerIcons[selectedProvider];
                                if (!prov) return null;
                                return (
                                    <div className="ai-modal-header" style={{ borderColor: prov.borderColor }}>
                                        <div className="ai-modal-icon" style={{ color: prov.color, background: prov.bgColor }}><Icon /></div>
                                        <div><h2 style={{ margin: 0 }}>{prov.name}</h2><p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>{t('configure_ai_key')}</p></div>
                                    </div>
                                );
                            })()}
                            <div className="input-container" style={{ marginTop: '16px' }}>
                                <label className="label">{t('select_model')}</label>
                                <div className="model-list">
                                    {AI_PROVIDERS.find(p => p.id === selectedProvider)?.models.map(model => (
                                        <button key={model.id} type="button" className={`model-item ${selectedModel === model.id ? 'active' : ''}`} onClick={() => setSelectedModel(model.id)}>
                                            <div className="model-name">{model.name}</div>
                                            <div className="model-desc">{model.desc}</div>
                                            {selectedModel === model.id && <Check size={13} className="model-check" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="input-container">
                                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Key size={11} /> API Key</label>
                                <input type="password" placeholder={AI_PROVIDERS.find(p => p.id === selectedProvider)?.placeholder || ''} value={apiKey} onChange={e => setApiKey(e.target.value)} style={{ paddingLeft: '14px', fontFamily: 'monospace' }} />
                                <a href={AI_PROVIDERS.find(p => p.id === selectedProvider)?.docsUrl} target="_blank" rel="noreferrer" className="key-docs-link"><ExternalLink size={10} /> {t('get_api_key')}</a>
                            </div>
                            <button className="btn-primary" onClick={handleSaveAiKey} disabled={!apiKey || saving} style={{ marginTop: '8px' }}>
                                {saving ? t('saving') : <><Save size={15} /> {t('save_ai_key')}</>}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Settings;
