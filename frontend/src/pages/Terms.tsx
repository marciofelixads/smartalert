import React from 'react';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
    return (
        <div className="auth-layout" style={{ display: 'block', padding: '40px 20px', overflowY: 'auto' }}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left', padding: '40px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Scale color="#3b82f6" size={28} />
                    </div>
                    <div>
                        <h1 className="title-font" style={{ fontSize: '2rem', margin: 0 }}>Terms of Service</h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Effective Date: February 26, 2026</p>
                    </div>
                </div>

                <div className="legal-content" style={{ color: '#cbd5e1', lineHeight: '1.7' }}>
                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: 'white' }}>1. Agreement to Terms</h2>
                        <p>
                            By accessing or using SmartAlert, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
                        </p>
                    </section>

                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: 'white' }}>2. Use of Service</h2>
                        <p>You agree to use the service only for lawful purposes. Specifically, you agree not to:</p>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li>Send spam or unsolicited messages via WhatsApp</li>
                            <li>Violate Meta's WhatsApp Business Policy</li>
                            <li>Attempt to circumvent any platform security measures</li>
                            <li>Use the service to transmit malicious software or phishing content</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: 'white' }}>3. WhatsApp Business Rules</h2>
                        <p>
                            SmartAlert utilizes the Meta Cloud API. Your use of this integration requires compliance with:
                        </p>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li>Meta's WhatsApp Business Terms of Service</li>
                            <li>WhatsApp Business Messaging Policy</li>
                        </ul>
                        <p>
                            Violation of these rules may result in immediate suspension of your SmartAlert account and potential blocking by Meta.
                        </p>
                    </section>

                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: 'white' }}>4. AI Content Disclaimer</h2>
                        <p>
                            AI-generated message copy is provided for convenience. Users are responsible for reviewing and ensuring all AI-generated content complies with their local regulations and business standards before sending.
                        </p>
                    </section>

                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: 'white' }}>5. Limitation of Liability</h2>
                        <p>
                            SmartAlert is provided "as is". We are not liable for any service interruptions caused by third-party providers (Meta, Cloudflare, or AI providers) or for any business losses resulting from message delivery failures.
                        </p>
                    </section>

                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: 'white' }}>6. Account Termination</h2>
                        <p>
                            We reserve the right to terminate or suspend access to our service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or third parties.
                        </p>
                    </section>

                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: 'white' }}>7. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these terms at any time. We will provide notice of significant changes by updating the "Effective Date" at the top of this document.
                        </p>
                    </section>
                </div>

                <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                    <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>← Back to Application</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Terms;
