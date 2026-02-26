import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
    return (
        <div className="auth-layout" style={{ display: 'block', padding: '40px 20px', overflowY: 'auto' }}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left', padding: '40px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'rgba(37, 211, 102, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield color="#25D366" size={28} />
                    </div>
                    <div>
                        <h1 className="title-font" style={{ fontSize: '2rem', margin: 0 }}>Privacy Policy</h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Last Updated: February 26, 2026</p>
                    </div>
                </div>

                <div className="legal-content" style={{ color: '#cbd5e1', lineHeight: '1.7' }}>
                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: 'white' }}>1. Introduction</h2>
                        <p>
                            SmartAlert ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our WhatsApp notification platform and associated services.
                        </p>
                    </section>

                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: 'white' }}>2. Data Collection via Meta/WhatsApp</h2>
                        <p>
                            When you connect your WhatsApp Business Account via Meta OAuth, we collect and store:
                        </p>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li>WhatsApp Business Account ID (WABA ID)</li>
                            <li>Phone Number ID</li>
                            <li>Meta Access Tokens (stored encrypted using AES-256)</li>
                        </ul>
                        <p>
                            We use this data solely to provide the notification services you configure within our platform.
                        </p>
                    </section>

                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: 'white' }}>3. How We Use Your Information</h2>
                        <p>Your information is used to:</p>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li>Authenticate your access to the platform</li>
                            <li>Process and send scheduled WhatsApp alerts</li>
                            <li>Provide AI-powered message generation services</li>
                            <li>Improve platform stability and performance</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: 'white' }}>4. Data Security</h2>
                        <p>
                            Security is our top priority. We implement industry-standard security measures, including:
                        </p>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li>AES-256-CBC encryption for all third-party API tokens</li>
                            <li>Secure SSL/TLS transmission for all data</li>
                            <li>Regular security audits of our codebase</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: 'white' }}>5. Third-Party Services</h2>
                        <p>
                            We integrate with Meta Platforms, Inc. to provide WhatsApp connectivity. Use of these services is subject to Meta's Privacy Policy. If you enable AI features, data may be processed by your chosen AI provider (OpenAI, Anthropic, or Google) according to their respective privacy terms.
                        </p>
                    </section>

                    <section style={{ marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h2 style={{ color: 'white', marginTop: 0 }}>Contact Us</h2>
                        <p>If you have questions about this Privacy Policy, please contact us at:</p>
                        <p style={{ fontWeight: 600, color: 'var(--whatsapp)' }}>privacy@smartalert.com</p>
                    </section>
                </div>

                <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                    <Link to="/login" style={{ color: 'var(--whatsapp)', textDecoration: 'none', fontWeight: 600 }}>← Back to Application</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Privacy;
