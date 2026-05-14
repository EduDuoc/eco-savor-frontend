// LoginView - View Layer (MVVM Pattern) - Diseño actualizado 2026
import React, { useState } from 'react';
import { useAuthViewModel } from '../modules/index.js';
import { AuthFooter } from '../components/AuthFooter';

export function LoginView({ onNavigate }) {
  const { login, loading, error } = useAuthViewModel();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('buyer'); // 'buyer' o 'admin'

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) {
      onNavigate?.('catalog');
    }
  };

  const handleGuestLogin = () => {
    // Navegar directo al catálogo sin autenticar
    onNavigate?.('catalog');
  };

  return (
    <div className="login-page">
      {/* Header */}
      <div className="login-header">
        <div className="login-header-logo">🌿</div>
        <h1>EcoSavor</h1>
        <p className="login-header-tagline">¿Tienes hambre? Compra, ahorra y ayuda al planeta 🌱</p>
        <p className="login-header-quote">
          "Cada producto que salvas es un paso hacia un planeta más limpio 🌍"
        </p>
      </div>

      {/* Formulario */}
      <div className="login-container">
        <div className="login-card">
          {/* Selector de rol */}
          <div className="login-role-selector">
            <button
              type="button"
              className={`role-btn ${selectedRole === 'buyer' ? 'active' : ''}`}
              onClick={() => setSelectedRole('buyer')}
            >
              🛒 Comprador
            </button>
            <button
              type="button"
              className={`role-btn ${selectedRole === 'admin' ? 'active' : ''}`}
              onClick={() => setSelectedRole('admin')}
            >
              ⚙️ Administrador
            </button>
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
