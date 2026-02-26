import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings as SettingsIcon, Zap, Globe, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Landing from './pages/Landing';
import './index.css';

const Navbar: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <nav className="app-navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <div className="navbar-brand-icon"><Zap size={16} color="white" /></div>
          SmartAlert
        </Link>

        <div className="navbar-right">
          <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={15} /> <span>{t('dashboard')}</span>
          </Link>

          <div className="api-status">
            <span className="api-dot"></span>
            <span>WhatsApp API</span>
          </div>

          {/* Avatar + Profile Dropdown */}
          <div style={{ position: 'relative' }} ref={profileRef}>
            <button className="user-avatar-btn" onClick={() => setShowProfile(!showProfile)}>
              {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="avatar-img-sm" /> : initials}
            </button>

            {showProfile && (
              <>
                <div className="profile-dropdown-overlay" onClick={() => setShowProfile(false)} />
                <div className="profile-dropdown">
                  <div className="profile-header">
                    <div className="profile-avatar-lg">
                      {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="avatar-img-lg" /> : initials}
                    </div>
                    <div>
                      <div className="profile-name">{user.name}</div>
                      <div className="profile-email">{user.email}</div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <Link
                      to="/settings"
                      className="profile-link-item"
                      onClick={() => setShowProfile(false)}
                    >
                      <SettingsIcon size={16} /> <span>{t('settings')}</span>
                    </Link>
                  </div>

                  <div className="profile-section">
                    <div className="profile-section-title">
                      <Globe size={10} style={{ display: 'inline', marginRight: '4px' }} />
                      {t('language')}
                    </div>
                    <div className="profile-lang-btns">
                      <button
                        className={`profile-lang-btn ${language === 'en' ? 'active' : ''}`}
                        onClick={() => setLanguage('en')}
                      >
                        <span className="profile-lang-dot"></span> English
                      </button>
                      <button
                        className={`profile-lang-btn ${language === 'pt' ? 'active' : ''}`}
                        onClick={() => setLanguage('pt')}
                      >
                        <span className="profile-lang-dot"></span> Português
                      </button>
                    </div>
                  </div>

                  <div className="profile-divider"></div>

                  <button className="profile-logout" onClick={() => { logout(); setShowProfile(false); }}>
                    <LogOut size={15} /> {t('logout')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();
  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.9rem' }}>Loading...</div>;
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <footer className="app-footer">&copy; 2026 SmartAlert SaaS &bull; Intelligent Notifications Platform</footer>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
