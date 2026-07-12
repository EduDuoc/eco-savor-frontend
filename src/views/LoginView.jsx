// LoginView - View Layer (MVVM Pattern) - Diseño actualizado 2026
import React, { useState } from 'react';
import { useAuthViewModel } from '../modules/index.js';
import { AuthFooter } from '../components/AuthFooter';
import { AuthHeader } from '../components/AuthHeader';

const PROFILE_TABS = [
  { key: 'buyer', label: '🛒 Cliente', expectedRole: 'buyer' },
  { key: 'restaurant', label: '🏪 Administrador', expectedRole: 'restaurant' },
  { key: 'admin', label: '👔 Gerente', expectedRole: 'admin' },
];

export function LoginView({ onNavigate }) {
  const { login, loading, error } = useAuthViewModel();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [selectedProfile, setSelectedProfile] = useState('buyer');
  const [roleMismatchError, setRoleMismatchError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRoleMismatchError(null);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const expectedRole = PROFILE_TABS.find((tab) => tab.key === selectedProfile)?.expectedRole;
      const actualRole = result.data?.role || result.user?.role;

      if (expectedRole && actualRole && expectedRole !== actualRole) {
        setRoleMismatchError(
          `Este usuario es de tipo "${actualRole}", no "${expectedRole}". Te llevamos a tu panel correcto.`
        );
      }

      onNavigate?.('catalog');
    }
  };

  const handleGuestLogin = () => {
    onNavigate?.('catalog');
  };

  return (
    <div className="login-page">
      <AuthHeader />

      <div className="login-container">
        <div className="login-card">
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '1.5rem',
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: '12px',
            }}
          >
            {PROFILE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedProfile(tab.key)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  border: 'none',
                  borderRadius: '8px',
                  background: selectedProfile === tab.key ? '#fff' : 'transparent',
                  color: selectedProfile === tab.key ? '#059669' : '#64748b',
                  fontWeight: selectedProfile === tab.key ? 'bold' : 'normal',
                  boxShadow: selectedProfile === tab.key ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="demo@ecosaver.com"
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="••••••••"
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {roleMismatchError && (
              <div
                style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginTop: '0.75rem',
                }}
              >
                {roleMismatchError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '1rem' }}
            >
              Iniciar sesión →
            </button>
          </form>

          <p className="login-hint">
            Usa cualquier email y contraseña para continuar
          </p>

          <button
            onClick={handleGuestLogin}
            className="btn-primary btn-guest"
          >
            Entrar como invitado 👀
          </button>

          <p className="auth-link" style={{ marginTop: '1.5rem', textAlign: 'center', color: '#64748b' }}>
            ¿No tenés cuenta?{' '}
            <button onClick={() => onNavigate?.('register')} className="btn-link">
              Registrate
            </button>
          </p>
        </div>
      </div>

      <AuthFooter />
    </div>
  );
}