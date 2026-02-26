import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Zap, Shield, Cpu, ArrowRight,
    MessageSquare, CheckCircle, Globe,
    LayoutDashboard, Lock, BarChart3,
    Clock, Users, TrendingUp, Star,
    Smartphone, Bell, FileText
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Landing: React.FC = () => {
    const { t } = useLanguage();

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1, y: 0,
            transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }
        })
    };

    const stats = [
        { value: '99.9%', label: t('wa_uptime'), icon: <Shield size={16} /> },
        { value: '<1s', label: t('wa_instant_delivery'), icon: <Zap size={16} /> },
        { value: '256-bit', label: t('landing_aes'), icon: <Lock size={16} /> },
        { value: '24/7', label: t('landing_cron'), icon: <Clock size={16} /> }
    ];

    return (
        <div className="landing-page">
            {/* Header / Navbar */}
            <header className="landing-header">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                    <div className="landing-logo">
                        <div className="logo-icon"><Zap size={18} color="white" /></div>
                        <span>SmartAlert</span>
                    </div>
                    <nav className="landing-nav-links">
                        <a href="#features">{t('feature_reliability')}</a>
                        <a href="#showcase">{t('dashboard')}</a>
                        <a href="#how-it-works">{t('seamless_flow')}</a>
                    </nav>
                    <div className="landing-nav-btns">
                        <Link to="/login" className="btn-ghost">{t('login')}</Link>
                        <Link to="/register" className="btn-primary-sm">{t('register')}</Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-bg-glow"></div>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="hero-content"
                    >
                        <span className="badge-new">{t('version_badge')}</span>
                        <h1>{t('hero_title')}</h1>
                        <p className="hero-subtitle">{t('hero_subtitle')}</p>

                        <div className="hero-btns">
                            <Link to="/register" className="btn-primary-lg">
                                {t('cta_get_started')} <ArrowRight size={18} />
                            </Link>
                            <Link to="/login" className="btn-outline-lg">
                                {t('dashboard')} <LayoutDashboard size={18} />
                            </Link>
                        </div>

                        {/* Trust Badges */}
                        <div className="hero-trust-badges">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    className="trust-badge"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                >
                                    <span className="trust-icon">{stat.icon}</span>
                                    <div>
                                        <strong>{stat.value}</strong>
                                        <span>{stat.label}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="hero-dashboard-preview"
                    >
                        <div className="mockup-browser">
                            <div className="mockup-header">
                                <div className="mockup-dots"><span></span><span></span><span></span></div>
                                <div className="mockup-url">
                                    <Lock size={10} />
                                    <span>smartalert.app/dashboard</span>
                                </div>
                            </div>
                            <img src="/screenshot-dashboard.png" alt="SmartAlert Dashboard" />
                        </div>
                        <div className="dashboard-glow"></div>
                    </motion.div>
                </div>
            </section>

            {/* Social Proof Numbers */}
            <section className="social-proof-section">
                <div className="container">
                    <div className="proof-grid">
                        <motion.div className="proof-item" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
                            <TrendingUp size={24} className="proof-icon" />
                            <div className="proof-number">10K+</div>
                            <div className="proof-label">{t('proof_notifications')}</div>
                        </motion.div>
                        <motion.div className="proof-item" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
                            <Users size={24} className="proof-icon" />
                            <div className="proof-number">500+</div>
                            <div className="proof-label">{t('proof_clients')}</div>
                        </motion.div>
                        <motion.div className="proof-item" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
                            <BarChart3 size={24} className="proof-icon" />
                            <div className="proof-number">96%</div>
                            <div className="proof-label">{t('proof_delivery')}</div>
                        </motion.div>
                        <motion.div className="proof-item" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}>
                            <Star size={24} className="proof-icon" />
                            <div className="proof-number">4.9★</div>
                            <div className="proof-label">{t('proof_rating')}</div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section" id="features">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">{t('seamless_flow')}</span>
                        <h2>{t('infra_title')}</h2>
                        <p>{t('infra_desc')}</p>
                    </div>

                    <div className="features-grid">
                        {[
                            { icon: <MessageSquare size={24} />, color: '#25D366', bg: 'rgba(37, 211, 102, 0.1)', title: t('feature_reliability'), desc: t('feature_reliability_desc') },
                            { icon: <Cpu size={24} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', title: t('feature_ai'), desc: t('feature_ai_desc') },
                            { icon: <Lock size={24} />, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', title: t('feature_secure'), desc: t('feature_secure_desc') },
                            { icon: <Bell size={24} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', title: t('feat_scheduling'), desc: t('feat_scheduling_desc') },
                            { icon: <FileText size={24} />, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', title: t('feat_templates'), desc: t('feat_templates_desc') },
                            { icon: <BarChart3 size={24} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', title: t('feat_analytics'), desc: t('feat_analytics_desc') }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -8, boxShadow: `0 20px 40px ${feature.bg}` }}
                                className="feature-card"
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={i}
                            >
                                <div className="feature-icon" style={{ background: feature.bg }}>
                                    {React.cloneElement(feature.icon, { color: feature.color })}
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product Showcase */}
            <section className="showcase-section" id="showcase">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">{t('showcase_label')}</span>
                        <h2>{t('showcase_title')}</h2>
                        <p>{t('showcase_desc')}</p>
                    </div>

                    <div className="showcase-grid">
                        <motion.div
                            className="showcase-card showcase-main"
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={0}
                        >
                            <div className="showcase-label">
                                <LayoutDashboard size={14} />
                                {t('showcase_dashboard_label')}
                            </div>
                            <div className="showcase-img-wrapper">
                                <img src="/screenshot-dashboard.png" alt="SmartAlert Dashboard" />
                            </div>
                            <div className="showcase-desc">
                                <h4>{t('showcase_dashboard_title')}</h4>
                                <p>{t('showcase_dashboard_desc')}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="showcase-card showcase-side"
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={1}
                        >
                            <div className="showcase-label">
                                <Smartphone size={14} />
                                {t('showcase_quiz_label')}
                            </div>
                            <div className="showcase-img-wrapper">
                                <img src="/screenshot-quiz.png" alt="SmartAlert Quiz" />
                            </div>
                            <div className="showcase-desc">
                                <h4>{t('showcase_quiz_title')}</h4>
                                <p>{t('showcase_quiz_desc')}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="showcase-card showcase-side"
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={2}
                        >
                            <div className="showcase-label">
                                <Globe size={14} />
                                Meta Business API
                            </div>
                            <div className="showcase-img-wrapper showcase-wa-preview">
                                <div className="wa-chat-mockup">
                                    <div className="wa-chat-header-mock">
                                        <div className="wa-avatar-mock">SA</div>
                                        <div>
                                            <div className="wa-name-mock">SmartAlert <CheckCircle size={10} color="#25D366" /></div>
                                            <div className="wa-status-mock">online</div>
                                        </div>
                                    </div>
                                    <div className="wa-messages-mock">
                                        <div className="wa-msg-mock received">
                                            <p>{t('wa_mock_msg1')}</p>
                                            <p>{t('wa_mock_msg2')}</p>
                                            <p><a href="#">{t('wa_mock_msg3')}</a></p>
                                            <span className="wa-time-mock">14:21 ✓✓</span>
                                        </div>
                                        <div className="wa-msg-mock sent">
                                            <p>{t('wa_mock_reply')}</p>
                                            <span className="wa-time-mock">14:23</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="showcase-desc">
                                <h4>{t('showcase_wa_title')}</h4>
                                <p>{t('showcase_wa_desc')}</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="integration-section" id="how-it-works">
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
                    <div>
                        <span className="section-label">{t('seamless_flow')}</span>
                        <h2>{t('connect_title')}</h2>
                        <div className="flow-steps">
                            <motion.div className="flow-step" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
                                <div className="step-num">01</div>
                                <div>
                                    <h4>{t('step1_title')}</h4>
                                    <p>{t('step1_desc')}</p>
                                </div>
                            </motion.div>
                            <motion.div className="flow-step" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
                                <div className="step-num">02</div>
                                <div>
                                    <h4>{t('step2_title')}</h4>
                                    <p>{t('step2_desc')}</p>
                                </div>
                            </motion.div>
                            <motion.div className="flow-step" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
                                <div className="step-num">03</div>
                                <div>
                                    <h4>{t('step3_title')}</h4>
                                    <p>{t('step3_desc')}</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                    <div className="integration-visual">
                        <div className="wa-bubble-preview">
                            <MessageSquare size={32} color="white" />
                            <div className="wa-bubble-content">
                                <div className="wa-bubble-header">SmartAlert <CheckCircle size={10} /></div>
                                <div className="wa-bubble-text">{t('preview_message')}</div>
                                <div className="wa-bubble-time">13:21</div>
                            </div>
                        </div>
                        <div className="meta-badge-floating">
                            <Globe size={14} /> {t('official_partner')}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <motion.div
                        className="cta-card"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2>{t('cta_title')}</h2>
                        <p>{t('cta_desc')}</p>
                        <div className="cta-btns">
                            <Link to="/register" className="btn-primary-lg btn-glow">
                                {t('cta_get_started')} <ArrowRight size={18} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                            <div className="landing-logo">
                                <div className="logo-icon"><Zap size={18} color="white" /></div>
                                <span>SmartAlert</span>
                            </div>
                            <p style={{ marginTop: '15px', color: 'var(--text-muted)', maxWidth: '250px' }}>{t('footer_desc')}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '60px' }}>
                            <div className="footer-links">
                                <h6>{t('footer_platform')}</h6>
                                <Link to="/login">{t('login')}</Link>
                                <Link to="/register">{t('register')}</Link>
                                <Link to="/dashboard">{t('dashboard')}</Link>
                            </div>
                            <div className="footer-links">
                                <h6>{t('footer_legal')}</h6>
                                <Link to="/privacy">{t('privacy_policy')}</Link>
                                <Link to="/terms">{t('terms_of_service')}</Link>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        &copy; 2026 SmartAlert SaaS &bull; {t('footer_rights')}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
