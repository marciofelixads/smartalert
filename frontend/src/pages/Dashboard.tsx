import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Bell, Calendar,
    Clock, Trash2, TrendingUp, Zap,
    MessageSquare, CheckCircle, Sparkles, Brain,
    Repeat, RefreshCw, Paperclip, Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';

// Alert types with icons and colors
const ALERT_TYPES = [
    { value: 'payment', labelPt: 'Cobrança', labelEn: 'Payment', color: '#22c55e', icon: '💰' },
    { value: 'renewal', labelPt: 'Renovação', labelEn: 'Renewal', color: '#f59e0b', icon: '🔄' },
    { value: 'reminder', labelPt: 'Lembrete', labelEn: 'Reminder', color: '#3b82f6', icon: '🔔' },
    { value: 'after_sale', labelPt: 'Pós-venda', labelEn: 'After Sale', color: '#8b5cf6', icon: '🎁' },
    { value: 'birthday', labelPt: 'Aniversário', labelEn: 'Birthday', color: '#ec4899', icon: '🎂' },
    { value: 'contract', labelPt: 'Contrato', labelEn: 'Contract', color: '#06b6d4', icon: '📄' },
    { value: 'follow_up', labelPt: 'Follow-up', labelEn: 'Follow-up', color: '#f97316', icon: '📞' },
    { value: 'meeting', labelPt: 'Reunião', labelEn: 'Meeting', color: '#6366f1', icon: '🤝' },
];

const PRIORITIES = [
    { value: 'low', labelPt: 'Baixa', labelEn: 'Low', color: '#3b82f6', icon: '🔵' },
    { value: 'medium', labelPt: 'Média', labelEn: 'Medium', color: '#f59e0b', icon: '🟡' },
    { value: 'high', labelPt: 'Alta', labelEn: 'High', color: '#ef4444', icon: '🔴' },
    { value: 'urgent', labelPt: 'Urgente', labelEn: 'Urgent', color: '#dc2626', icon: '🚨' },
];

const RECURRENCE_OPTIONS = [
    { value: 'once', labelPt: 'Uma vez', labelEn: 'Once', icon: '📌' },
    { value: 'daily', labelPt: 'Diário', labelEn: 'Daily', icon: '📅' },
    { value: 'weekly', labelPt: 'Semanal', labelEn: 'Weekly', icon: '📆' },
    { value: 'monthly', labelPt: 'Mensal', labelEn: 'Monthly', icon: '🗓️' },
    { value: 'business_days', labelPt: 'Dias úteis', labelEn: 'Business Days', icon: '💼' },
    { value: 'custom', labelPt: 'Personalizado', labelEn: 'Custom', icon: '⚙️' },
];

const COUNTRY_CODES = [
    { code: '+55', flag: '🇧🇷', name: 'Brasil' },
    { code: '+1', flag: '🇺🇸', name: 'USA/Canada' },
    { code: '+351', flag: '🇵🇹', name: 'Portugal' },
    { code: '+34', flag: '🇪🇸', name: 'España' },
    { code: '+44', flag: '🇬🇧', name: 'UK' },
    { code: '+54', flag: '🇦🇷', name: 'Argentina' },
    { code: '+52', flag: '🇲🇽', name: 'México' },
    { code: '+33', flag: '🇫🇷', name: 'France' },
    { code: '+49', flag: '🇩🇪', name: 'Germany' },
    { code: '+39', flag: '🇮🇹', name: 'Italy' },
    { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
    { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
    { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
];

const STATUS_CONFIG: Record<string, { labelPt: string; labelEn: string; color: string; icon: string }> = {
    scheduled: { labelPt: 'Agendado', labelEn: 'Scheduled', color: '#f59e0b', icon: '🕒' },
    sent: { labelPt: 'Enviado', labelEn: 'Sent', color: '#3b82f6', icon: '📤' },
    delivered: { labelPt: 'Entregue', labelEn: 'Delivered', color: '#22c55e', icon: '✅' },
    read: { labelPt: 'Visualizado', labelEn: 'Read', color: '#06b6d4', icon: '👀' },
    replied: { labelPt: 'Respondido', labelEn: 'Replied', color: '#8b5cf6', icon: '💬' },
    failed: { labelPt: 'Falhou', labelEn: 'Failed', color: '#ef4444', icon: '❌' },
    rescheduled: { labelPt: 'Reagendado', labelEn: 'Rescheduled', color: '#f97316', icon: '🔁' },
    cancelled: { labelPt: 'Cancelado', labelEn: 'Cancelled', color: '#6b7280', icon: '🚫' },
};

// AI generated messages per tone
interface Alert {
    id: number;
    clientName: string;
    clientPhone: string;
    type: string;
    message: string;
    sendDate: string;
    status: string;
    priority: string;
    recurrence: string;
    aiGenerated: boolean;
    retryCount: number;
    maxRetries: number;
}

interface Stats {
    activeAlerts: number;
    next7Days: number;
    sentToday: number;
    deliveryRate: number;
    responseRate?: number;
    customerScore?: number;
    priorities?: Record<string, number>;
}

interface AlertLog {
    id: number;
    action: string;
    details: string;
    createdAt: string;
}

const Dashboard: React.FC = () => {
    const { t, language } = useLanguage();
    const { user, token } = useAuth();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [stats, setStats] = useState<Stats>({ activeAlerts: 0, next7Days: 0, sentToday: 0, deliveryRate: 100 });
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    // Form state
    const [formClient, setFormClient] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formDate, setFormDate] = useState('');
    const [formTime, setFormTime] = useState('09:00');
    const [formMessage, setFormMessage] = useState('');
    const [selectedType, setSelectedType] = useState('payment');
    const [selectedPriority, setSelectedPriority] = useState('medium');
    const [selectedRecurrence, setSelectedRecurrence] = useState('once');
    const [customDays, setCustomDays] = useState('7');
    const [recurrenceEnd, setRecurrenceEnd] = useState('');
    const [autoRetry, setAutoRetry] = useState(true);
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [countryCode, setCountryCode] = useState('+55');
    const [aiPrompt, setAiPrompt] = useState('');

    // Custom types
    const [customTypes, setCustomTypes] = useState<{ value: string, labelPt: string, labelEn: string, color: string, icon: string }[]>([]);
    const [showNewType, setShowNewType] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');

    // AI message generation
    const [selectedTone, setSelectedTone] = useState('friendly');
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Quiz state
    const [currentStep, setCurrentStep] = useState(1);
    const [editingAlertId, setEditingAlertId] = useState<number | null>(null);

    // Timeline state
    const [showTimeline, setShowTimeline] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [timelineLogs, setTimelineLogs] = useState<AlertLog[]>([]);
    const [isTimelineLoading, setIsTimelineLoading] = useState(false);

    const allTypes = [...ALERT_TYPES, ...customTypes];

    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        headers: { Authorization: `Bearer ${token}` }
    });

    const fetchData = useCallback(async () => {
        try {
            const [alertsRes, statsRes] = await Promise.all([
                api.get('/alerts'),
                api.get('/alerts/stats')
            ]);
            setAlerts(alertsRes.data.alerts || []);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = alerts.filter(a => {
        const matchSearch = a.clientName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const getTypeConfig = (type: string) => {
        return allTypes.find(t => t.value === type) || { value: type, labelPt: type, labelEn: type, color: '#6b7280', icon: '📋' };
    };

    const handleAddType = () => {
        if (newTypeName.trim()) {
            const val = newTypeName.toLowerCase().replace(/\s+/g, '_');
            setCustomTypes([...customTypes, { value: val, labelPt: newTypeName, labelEn: newTypeName, color: '#8b5cf6', icon: '📋' }]);
            setNewTypeName('');
            setShowNewType(false);
        }
    };

    const handleGenerateAI = async () => {
        if (!aiPrompt.trim()) {
            alert(language === 'pt' ? 'Por favor, descreva o que deseja gerar.' : 'Please describe what you want to generate.');
            return;
        }
        setIsGenerating(true);
        try {
            const res = await api.post('/ai/generate', {
                prompt: aiPrompt,
                context: {
                    clientName: formClient,
                    alertType: selectedType,
                    tone: selectedTone,
                    language: language,
                    attachmentUrl: attachmentUrl || null,
                    scheduledDate: formDate || null
                }
            });
            setGeneratedMessage(res.data.message);
            setFormMessage(res.data.message);
        } catch (err: any) {
            console.error('AI error:', err);
            alert(err.response?.data?.error || 'AI generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCreateAlert = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formClient || !formPhone || !formDate) return;
        try {
            const fullPhone = formPhone.startsWith('+') ? formPhone : `${countryCode}${formPhone.replace(/\D/g, '')}`;
            const sendDateTime = `${formDate}T${formTime || '09:00'}:00`;
            const alertData = {
                clientName: formClient,
                clientPhone: fullPhone,
                type: selectedType,
                message: formMessage || generatedMessage,
                sendDate: sendDateTime,
                aiGenerated: !!generatedMessage,
                aiTone: generatedMessage ? selectedTone : null,
                priority: selectedPriority,
                recurrence: selectedRecurrence,
                recurrenceDays: selectedRecurrence === 'custom' ? parseInt(customDays) : null,
                recurrenceEnd: recurrenceEnd || null,
                autoRetry,
                attachmentUrl: attachmentUrl || null
            };

            if (editingAlertId) {
                await api.put(`/alerts/${editingAlertId}`, alertData);
            } else {
                await api.post('/alerts', alertData);
            }
            setShowModal(false);
            resetForm();
            setEditingAlertId(null);
            fetchData();
        } catch (err) {
            console.error(editingAlertId ? 'Update alert error:' : 'Create alert error:', err);
        }
    };

    const resetForm = () => {
        setFormClient(''); setFormPhone(''); setFormDate(''); setFormTime('09:00');
        setFormMessage(''); setGeneratedMessage(''); setSelectedType('payment');
        setSelectedPriority('medium'); setSelectedRecurrence('once');
        setCustomDays('7'); setRecurrenceEnd(''); setAutoRetry(true);
        setAttachmentUrl(''); setEditingAlertId(null); setAiPrompt(''); setCurrentStep(1);
    };

    const handleEditAlert = (alert: Alert) => {
        setEditingAlertId(alert.id);
        setFormClient(alert.clientName);
        setFormPhone(alert.clientPhone.replace(/^\+\d{1,3}/, ''));
        setCountryCode(alert.clientPhone.match(/^(\+\d{1,3})/)?.[1] || '+55');
        const dateObj = new Date(alert.sendDate);
        setFormDate(dateObj.toISOString().split('T')[0]);
        setFormTime(dateObj.toTimeString().slice(0, 5));
        setFormMessage(alert.message);
        setSelectedType(alert.type);
        setSelectedPriority(alert.priority || 'medium');
        setSelectedRecurrence(alert.recurrence || 'once');
        setAutoRetry(alert.retryCount > 0);
        setCurrentStep(1);
        setShowModal(true);
    };

    const handleDeleteAlert = async (id: number) => {
        try {
            await api.delete(`/alerts/${id}`);
            fetchData();
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const handleViewTimeline = async (alert: Alert) => {
        setSelectedAlert(alert);
        setShowTimeline(true);
        setIsTimelineLoading(true);
        try {
            const res = await api.get(`/alerts/${alert.id}/logs`);
            setTimelineLogs(res.data.logs || []);
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        } finally {
            setIsTimelineLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        return STATUS_CONFIG[status] || { labelPt: status, labelEn: status, color: '#6b7280', icon: '❔' };
    };

    const getPriorityConfig = (priority: string) => {
        return PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];
    };

    const getRecurrenceLabel = (rec: string) => {
        const opt = RECURRENCE_OPTIONS.find(r => r.value === rec);
        if (!opt) return rec;
        return language === 'pt' ? opt.labelPt : opt.labelEn;
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                    <h1>{t('dashboard')}</h1>
                    <p>{t('welcome_msg').replace('{name}', '')} <span className="highlight">{user?.name}</span></p>
                </motion.div>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setShowModal(true); setCurrentStep(1); }}
                    className="btn-whatsapp"
                >
                    <Plus size={16} /> {t('create_alert')}
                </motion.button>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <div>
                        <div className="stat-label">{t('active_alerts')}</div>
                        <div className="stat-value">{stats.activeAlerts}</div>
                        <div className="stat-sub">{t('awaiting_send')}</div>
                    </div>
                    <div className="stat-icon blue"><Bell size={18} /></div>
                </motion.div>

                <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div>
                        <div className="stat-label">{t('next_7_days')}</div>
                        <div className="stat-value">{stats.next7Days}</div>
                        <div className="stat-sub">{t('upcoming')}</div>
                    </div>
                    <div className="stat-icon amber"><Calendar size={18} /></div>
                </motion.div>

                <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div>
                        <div className="stat-label">{t('health_score')}</div>
                        <div className="stat-value" style={{ color: (stats.customerScore || 0) > 70 ? 'var(--emerald)' : (stats.customerScore || 0) > 40 ? 'var(--amber)' : 'var(--red)' }}>
                            {stats.customerScore || 0}/100
                        </div>
                        <div className="stat-sub">{t('portfolio_quality')}</div>
                    </div>
                    <div className="stat-icon green"><Zap size={18} /></div>
                </motion.div>

                <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div>
                        <div className="stat-label">{t('response_rate')}</div>
                        <div className="stat-value">{stats.responseRate || 0}%</div>
                        <div className="stat-sub">{t('real_interactions')}</div>
                    </div>
                    <div className="stat-icon purple"><MessageSquare size={18} /></div>
                </motion.div>
            </div>

            <div className="ai-card" style={{ marginBottom: '24px' }}>
                <div className="ai-card-header">
                    <div className="ai-badge">
                        <Brain size={12} /> IA EXECUTIVE
                    </div>
                    <div className="ai-label">{t('ai_insight_title')}</div>
                </div>

                <div className="ai-grid">
                    <div className="ai-insight">
                        <div className="ai-insight-label">
                            <Zap size={10} /> {t('portfolio_health')}
                        </div>
                        <div className="ai-insight-value emerald">
                            {stats.deliveryRate}%
                        </div>
                        <div className="ai-insight-hint">{t('verified_deliveries')}</div>
                    </div>

                    <div className="ai-insight">
                        <div className="ai-insight-label">
                            <TrendingUp size={10} /> {t('response_effectiveness')}
                        </div>
                        <div className="ai-insight-value cyan">
                            +{stats.responseRate || 0}%
                        </div>
                        <div className="ai-insight-hint">{t('based_on_interactions')}</div>
                    </div>

                    <div className="ai-insight">
                        <div className="ai-insight-label">
                            <Clock size={10} /> {t('urgent_alerts')}
                        </div>
                        <div className="ai-insight-value" style={{ color: 'var(--red)' }}>
                            {stats.priorities?.urgent || 0}
                        </div>
                        <div className="ai-insight-hint">{t('awaiting_send')}</div>
                    </div>
                </div>
            </div>

            {/* Alerts Table */}
            <motion.div className="table-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="table-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="table-title">{t('upcoming_alerts')}</span>
                        <span className="table-badge">{alerts.length}</span>
                        {/* Status filter pills */}
                        <div className="status-filter-pills">
                            <button
                                className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('all')}
                            >
                                {t('filter_all')}
                            </button>
                            {Object.entries(STATUS_CONFIG).slice(0, 5).map(([key, cfg]) => (
                                <button
                                    key={key}
                                    className={`filter-pill ${statusFilter === key ? 'active' : ''}`}
                                    onClick={() => setStatusFilter(key)}
                                    style={statusFilter === key ? { borderColor: cfg.color, color: cfg.color } : {}}
                                >
                                    {cfg.icon} {language === 'pt' ? cfg.labelPt : cfg.labelEn}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="search-box">
                        <Search size={13} />
                        <input
                            type="text" placeholder={t('search_placeholder')}
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="empty-state">
                        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('client')}</th>
                                <th>{t('type')}</th>
                                <th>{t('priority_label')}</th>
                                <th>{t('date')}</th>
                                <th>{t('recurrence_label')}</th>
                                <th>{t('status')}</th>
                                <th style={{ textAlign: 'right' }}>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filtered.map((alert, i) => {
                                    const typeConfig = getTypeConfig(alert.type);
                                    const statusCfg = getStatusConfig(alert.status);
                                    const priorityCfg = getPriorityConfig(alert.priority);

                                    return (
                                        <motion.tr key={alert.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                            <td>
                                                <div className="client-info">
                                                    <div className="client-avatar" style={{ background: `${typeConfig.color}22`, color: typeConfig.color }}>
                                                        {alert.clientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="client-name">{alert.clientName}</div>
                                                        <div className="client-phone">{alert.clientPhone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="type-badge-new" style={{ background: `${typeConfig.color}18`, color: typeConfig.color, borderColor: `${typeConfig.color}40` }}>
                                                    {typeConfig.icon} {language === 'pt' ? typeConfig.labelPt : typeConfig.labelEn}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="priority-badge" style={{ color: priorityCfg.color }}>
                                                    {priorityCfg.icon} {language === 'pt' ? priorityCfg.labelPt : priorityCfg.labelEn}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>
                                                {new Date(alert.sendDate).toLocaleDateString('pt-BR')}
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    {new Date(alert.sendDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td>
                                                {alert.recurrence !== 'once' ? (
                                                    <span className="recurrence-badge">
                                                        <Repeat size={11} /> {getRecurrenceLabel(alert.recurrence)}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="status-badge-new" style={{ background: `${statusCfg.color}18`, color: statusCfg.color, borderColor: `${statusCfg.color}40` }}>
                                                    {statusCfg.icon} {language === 'pt' ? statusCfg.labelPt : statusCfg.labelEn}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="row-actions">
                                                    <button className="action-btn" onClick={() => handleEditAlert(alert)} title={language === 'pt' ? 'Editar' : 'Edit'}><Edit3 size={13} /></button>
                                                    <button className="action-btn" onClick={() => handleViewTimeline(alert)} title={language === 'pt' ? 'Ver Timeline' : 'View Timeline'}><Clock size={13} /></button>
                                                    <button className="action-btn danger" onClick={() => handleDeleteAlert(alert.id)} title={language === 'pt' ? 'Excluir' : 'Delete'}><Trash2 size={13} /></button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon"><Bell size={24} /></div>
                        <h3>{t('no_alerts')}</h3>
                        <p>{t('no_alerts_desc')}</p>
                    </div>
                )}
            </motion.div>

            {/* API Bar */}
            <motion.div className="api-bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <div className="api-bar-item">
                        <Zap size={12} style={{ color: 'var(--whatsapp)' }} />
                        <strong>API:</strong> Evolution v2.2.3
                    </div>
                    <div className="api-bar-sep"></div>
                    <div className="api-bar-item">
                        <CheckCircle size={12} style={{ color: 'var(--emerald)' }} />
                        <strong>{t('production')}:</strong> WhatsApp Cloud API
                    </div>
                    <div className="api-bar-sep"></div>
                    <div className="api-bar-item">
                        <RefreshCw size={12} style={{ color: 'var(--cyan)' }} />
                        <strong>Cron:</strong> {t('cron_active')}
                    </div>
                </div>
                <div className="api-bar-item">
                    {t('last_sync')}: {new Date().toLocaleTimeString(language === 'pt' ? 'pt-BR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </motion.div>

            {/* ═══════════════════════════════════════ */}
            {/* CREATE ALERT MODAL — Enhanced          */}
            {/* ═══════════════════════════════════════ */}
            {/* ═══════════════════════════════════════ */}
            {/* CREATE ALERT MODAL — Quiz Style        */}
            {/* ═══════════════════════════════════════ */}
            {showModal && (
                <div className="quiz-modal-overlay" onClick={() => setShowModal(false)}>
                    <motion.div
                        className="quiz-card"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Progress Bar */}
                        <div className="quiz-progress-container">
                            <div className="quiz-progress-bar">
                                <motion.div
                                    className="quiz-progress-fill"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${(currentStep / 5) * 100}%` }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                />
                            </div>
                            <div className="quiz-step-indicator">
                                {t('quiz_step').replace('{step}', currentStep.toString()).replace('{total}', '5')}
                            </div>
                        </div>

                        <button className="quiz-close" onClick={() => { setShowModal(false); setCurrentStep(1); }}>&times;</button>

                        <AnimatePresence mode="wait">
                            {/* STEP 1: Who */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="quiz-step"
                                >
                                    <div className="quiz-step-header">
                                        <div className="quiz-step-icon">👤</div>
                                        <h2>{t('quiz_step1_title')}</h2>
                                        <p>{t('quiz_step1_subtitle')}</p>
                                    </div>

                                    <div className="quiz-input-group">
                                        <div className="input-container">
                                            <label className="label">{t('client')}</label>
                                            <input
                                                autoFocus
                                                placeholder={t('client_placeholder')}
                                                value={formClient}
                                                onChange={e => setFormClient(e.target.value)}
                                            />
                                        </div>
                                        <div className="input-container">
                                            <label className="label">{t('phone')}</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <select
                                                    className="quiz-select-ddi"
                                                    value={countryCode}
                                                    onChange={e => {
                                                        const newCode = e.target.value;
                                                        setCountryCode(newCode);
                                                        // Replace old prefix or prepend new code
                                                        const cleanedPhone = formPhone.replace(/^\+\d+\s*/, '');
                                                        setFormPhone(`${newCode} ${cleanedPhone}`);
                                                    }}
                                                >
                                                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                                                </select>
                                                <input
                                                    placeholder="Ex: +55 11 99999-0000"
                                                    style={{ flex: 1 }}
                                                    value={formPhone}
                                                    onChange={e => setFormPhone(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="input-container" style={{ marginTop: '5px' }}>
                                            <label className="label">
                                                <Paperclip size={12} /> {t('attachment_optional')}
                                            </label>
                                            <input
                                                placeholder={t('attachment_placeholder')}
                                                value={attachmentUrl}
                                                onChange={e => setAttachmentUrl(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="quiz-next-btn"
                                        disabled={!formClient || !formPhone}
                                        onClick={() => setCurrentStep(2)}
                                    >
                                        {t('continue')} →
                                    </button>
                                </motion.div>
                            )}

                            {/* STEP 2: Type */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="quiz-step"
                                >
                                    <div className="quiz-step-header">
                                        <div className="quiz-step-icon">💬</div>
                                        <h2>{t('quiz_step2_title')}</h2>
                                        <p>
                                            {selectedType === 'payment' ? t('quiz_step2_desc_payment') :
                                                selectedType === 'birthday' ? t('quiz_step2_desc_birthday') :
                                                    t('quiz_step2_desc_default')}
                                        </p>
                                    </div>

                                    <div className="quiz-grid-options">
                                        {allTypes.map(type => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                className={`quiz-option-card ${selectedType === type.value ? 'active' : ''}`}
                                                onClick={() => { setSelectedType(type.value); setTimeout(() => setCurrentStep(3), 300); }}
                                                style={selectedType === type.value ? { borderLeft: `4px solid ${type.color}` } : {}}
                                            >
                                                <span className="quiz-option-icon" style={{ background: `${type.color}15` }}>{type.icon}</span>
                                                <span className="quiz-option-label">{language === 'pt' ? type.labelPt : type.labelEn}</span>
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            className="quiz-option-card add-new"
                                            onClick={() => setShowNewType(!showNewType)}
                                        >
                                            <span className="quiz-option-icon">➕</span>
                                            <span className="quiz-option-label">{t('add_type')}</span>
                                        </button>
                                    </div>

                                    {showNewType && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="quiz-new-type-form">
                                            <input
                                                placeholder={t('new_type_placeholder')}
                                                value={newTypeName}
                                                onChange={e => setNewTypeName(e.target.value)}
                                            />
                                            <button type="button" onClick={handleAddType}>OK</button>
                                        </motion.div>
                                    )}

                                    <div className="quiz-nav-row">
                                        <button type="button" className="quiz-back-btn" onClick={() => setCurrentStep(1)}>← {t('back')}</button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: When */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="quiz-step"
                                >
                                    <div className="quiz-step-header">
                                        <div className="quiz-step-icon">📆</div>
                                        <h2>{t('quiz_step3_title')}</h2>
                                        <p>{t('quiz_step3_subtitle')}</p>
                                    </div>

                                    <div className="quiz-recurrence-row">
                                        {RECURRENCE_OPTIONS.map(r => (
                                            <button
                                                key={r.value}
                                                type="button"
                                                className={`quiz-rec-pill ${selectedRecurrence === r.value ? 'active' : ''}`}
                                                onClick={() => setSelectedRecurrence(r.value)}
                                            >
                                                {r.icon} {language === 'pt' ? r.labelPt : r.labelEn}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="quiz-datetime-grid">
                                        <div className="input-container">
                                            <label className="label">{t('date')}</label>
                                            <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
                                        </div>
                                        <div className="input-container">
                                            <label className="label">{t('time')}</label>
                                            <input type="time" value={formTime} onChange={e => setFormTime(e.target.value)} />
                                        </div>
                                    </div>

                                    {selectedRecurrence !== 'once' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="quiz-rec-settings">
                                            {selectedRecurrence === 'custom' && (
                                                <div className="quiz-custom-days">
                                                    <span>{t('every')}</span>
                                                    <input type="number" value={customDays} onChange={e => setCustomDays(e.target.value)} />
                                                    <span>{t('days_label')}</span>
                                                </div>
                                            )}
                                            <div className="input-container">
                                                <label className="label">{t('recurrence_end_optional')}</label>
                                                <input type="date" value={recurrenceEnd} onChange={e => setRecurrenceEnd(e.target.value)} />
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="quiz-nav-row">
                                        <button type="button" className="quiz-back-btn" onClick={() => setCurrentStep(2)}>← {t('back')}</button>
                                        <button type="button" className="quiz-next-btn primary" disabled={!formDate || !formTime} onClick={() => setCurrentStep(4)}>{t('continue')} →</button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 4: Tone & AI */}
                            {currentStep === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="quiz-step"
                                >
                                    <div className="quiz-step-header">
                                        <div className="quiz-step-icon">🤖</div>
                                        <h2>{t('quiz_step4_title')}</h2>
                                        <p>{t('quiz_step4_subtitle')}</p>
                                    </div>

                                    <div className="quiz-tone-grid">
                                        {[
                                            { id: 'friendly', icon: '🙂', label: t('tone_friendly') },
                                            { id: 'formal', icon: '📘', label: t('tone_formal') },
                                            { id: 'persuasive', icon: '🎯', label: t('tone_persuasive') }
                                        ].map(tone => (
                                            <button
                                                key={tone.id}
                                                type="button"
                                                className={`quiz-tone-card ${selectedTone === tone.id ? 'active' : ''}`}
                                                onClick={() => setSelectedTone(tone.id)}
                                            >
                                                <span className="tone-icon">{tone.icon}</span>
                                                <span className="tone-label">{tone.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="quiz-ai-prompt-box">
                                        <label className="label">{t('ai_obs_label')}</label>
                                        <textarea
                                            rows={2}
                                            placeholder={t('ai_obs_placeholder')}
                                            value={aiPrompt}
                                            onChange={e => setAiPrompt(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="quiz-ai-gen-btn"
                                            onClick={handleGenerateAI}
                                            disabled={isGenerating}
                                        >
                                            {isGenerating ? <div className="spinner-small" /> : <Sparkles size={14} />}
                                            {isGenerating ? t('generating') : t('generate_with_ai')}
                                        </button>
                                    </div>

                                    {generatedMessage && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="quiz-preview-message">
                                            <div className="preview-label">✨ {language === 'pt' ? 'Mensagem sugerida:' : 'Suggested message:'}</div>
                                            <textarea
                                                value={formMessage || generatedMessage}
                                                onChange={e => setFormMessage(e.target.value)}
                                                rows={4}
                                            />

                                        </motion.div>
                                    )}

                                    <div className="quiz-nav-row">
                                        <button type="button" className="quiz-back-btn" onClick={() => setCurrentStep(3)}>← {t('back')}</button>
                                        <button
                                            type="button"
                                            className="quiz-next-btn primary"
                                            disabled={!formMessage && !generatedMessage}
                                            onClick={() => setCurrentStep(5)}
                                        >
                                            {t('continue')} →
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 5: Review */}
                            {currentStep === 5 && (
                                <motion.div
                                    key="step5"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="quiz-step"
                                >
                                    <div className="quiz-step-header">
                                        <div className="quiz-step-icon">🚀</div>
                                        <h2>{t('quiz_step5_title')}</h2>
                                        <p>{t('quiz_step5_subtitle')}</p>
                                    </div>

                                    <div className="quiz-review-card">
                                        <div className="review-item">
                                            <span className="review-label">{t('client')}</span>
                                            <span className="review-value">{formClient}</span>
                                        </div>
                                        <div className="review-item">
                                            <span className="review-label">{t('type')}</span>
                                            <span className="review-value" style={{ color: getTypeConfig(selectedType).color }}>
                                                {getTypeConfig(selectedType).icon} {language === 'pt' ? getTypeConfig(selectedType).labelPt : getTypeConfig(selectedType).labelEn}
                                            </span>
                                        </div>
                                        <div className="review-item">
                                            <span className="review-label">{t('date')}</span>
                                            <span className="review-value">📅 {new Date(formDate + 'T' + formTime).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')} {language === 'pt' ? 'às' : 'at'} {formTime}</span>
                                        </div>
                                        <div className="review-item">
                                            <span className="review-label">{t('recurrence_label')}</span>
                                            <span className="review-value">🔄 {getRecurrenceLabel(selectedRecurrence)}</span>
                                        </div>
                                        <div className="review-item">
                                            <span className="review-label">{t('priority_label')}</span>
                                            <span className="review-value" style={{ color: getPriorityConfig(selectedPriority).color }}>
                                                {getPriorityConfig(selectedPriority).icon} {language === 'pt' ? getPriorityConfig(selectedPriority).labelPt : getPriorityConfig(selectedPriority).labelEn}
                                            </span>
                                        </div>
                                        <div className="review-item-auto">
                                            <div className="auto-info">
                                                <RefreshCw size={12} className={autoRetry ? 'spin-anim' : ''} />
                                                <span>{t('auto_retry')}</span>
                                            </div>
                                            <div className={`auto-status ${autoRetry ? 'on' : 'off'}`}>
                                                {autoRetry ? t('enabled') : t('disabled')}
                                            </div>
                                        </div>
                                        <div className="review-msg-preview">
                                            <div className="msg-header">💬 {t('summary_message')}</div>
                                            <div className="msg-body">{formMessage || generatedMessage}</div>
                                        </div>
                                    </div>

                                    <div className="quiz-nav-row" style={{ marginTop: '20px' }}>
                                        <button type="button" className="quiz-back-btn" onClick={() => setCurrentStep(4)}>← {t('back')}</button>
                                        <button
                                            type="button"
                                            className="quiz-final-btn"
                                            onClick={handleCreateAlert}
                                        >
                                            🚀 {t('schedule_alert')}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}

            {/* Timeline Modal */}
            <AnimatePresence>
                {showTimeline && selectedAlert && (
                    <div className="modal-overlay" onClick={() => setShowTimeline(false)}>
                        <motion.div
                            className="modal-card"
                            style={{ maxWidth: '450px' }}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button className="modal-close" onClick={() => setShowTimeline(false)}>×</button>
                            <h2 style={{ marginBottom: '8px' }}>{t('timeline_title')}: {selectedAlert.clientName}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '20px' }}>
                                {t('view_timeline')}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                                {isTimelineLoading ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>{t('generating')}</div>
                                ) : timelineLogs.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>{language === 'pt' ? 'Nenhum log encontrado.' : 'No logs found.'}</div>
                                ) : (
                                    timelineLogs.map((log, idx) => (
                                        <div key={log.id} style={{
                                            padding: '12px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '8px',
                                            borderLeft: `3px solid ${log.action === 'sent' ? 'var(--primary)' :
                                                log.action === 'delivered' ? 'var(--emerald)' :
                                                    log.action === 'read' ? 'var(--cyan)' :
                                                        log.action === 'response' ? 'var(--purple)' :
                                                            log.action === 'failed' ? 'var(--red)' : 'var(--text-muted)'
                                                }`,
                                            position: 'relative'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                                    {log.action}
                                                </span>
                                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                                    {new Date(log.createdAt).toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US')}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{log.details}</div>
                                            {idx < timelineLogs.length - 1 && (
                                                <div style={{ position: 'absolute', bottom: '-12px', left: '15px', width: '2px', height: '12px', background: 'var(--border)' }}></div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
