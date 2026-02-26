import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Register: React.FC = () => {
    const { t, language } = useLanguage();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { ...form, language });
            login(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="auth-layout">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="auth-brand"
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #25D366, #128C7E)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap color="white" size={22} />
                    </div>
                    <span className="title-font" style={{ fontSize: '1.4rem', fontWeight: 800 }}>SmartAlert</span>
                </div>

                <h2>{t('brand_title')}</h2>
                <p>{t('brand_desc')}</p>

                <div style={{ marginTop: '48px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '24px', borderRadius: '16px' }}>
                    <p style={{ fontSize: '0.88rem', fontStyle: 'italic', color: '#cbd5e1', lineHeight: 1.6 }}>"{t('client_quote')}"</p>
                    <p style={{ marginTop: '14px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--whatsapp)' }}>{t('client_quote_author')}</p>
                </div>
            </motion.div>

            <div className="auth-form-side">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="glass-card"
                >
                    <div style={{ marginBottom: '28px' }}>
                        <h1 className="title-gradient title-font" style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '6px' }}>{t('register_title')}</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{t('create_account_desc')}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-container" style={{ position: 'relative' }}>
                            <label className="label">{t('name')}</label>
                            <User className="input-icon" size={18} />
                            <input
                                required placeholder="John Doe"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                style={{ paddingLeft: '38px' }}
                            />
                        </div>

                        <div className="input-container" style={{ position: 'relative' }}>
                            <label className="label">{t('email')}</label>
                            <Mail className="input-icon" size={18} />
                            <input
                                required type="email" placeholder="name@company.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                style={{ paddingLeft: '38px' }}
                            />
                        </div>

                        <div className="input-container" style={{ position: 'relative' }}>
                            <label className="label">{t('password')}</label>
                            <Lock className="input-icon" size={18} />
                            <input
                                required type="password" placeholder="Min. 8 characters"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                style={{ paddingLeft: '38px' }}
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', color: '#f87171', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '12px', fontWeight: 600 }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <button type="submit" className="btn-primary">
                            <UserPlus size={18} /> {t('register')}
                        </button>
                    </form>

                    <div className="auth-footer">
                        {t('register_cta')} <Link to="/login" className="auth-link">{t('login')}</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
