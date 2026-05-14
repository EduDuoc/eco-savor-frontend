// LoginView - View Layer (MVVM Pattern) - Diseño actualizado 2026
import React, { useState } from 'react';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';

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

      {/* Footer */}
      <div className="login-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🌿 EcoSavor</h3>
            <p>
              Plataforma de reducción de desperdicio alimentario. Conectamos comercios 
              con productos próximos a vencer con consumidores que quieren ahorrar y 
              cuidar el planeta.
            </p>
          </div>

          <div className="footer-section">
            <h3>🌱 Nuestra misión</h3>
            <p>
              Reducir el desperdicio alimentario en Chile, dando una segunda oportunidad 
              a alimentos en perfecto estado. Cada compra en EcoSavor es un aporte al 
              medioambiente.
            </p>
            <div className="footer-stats">
              <span className="footer-stat">🌍 -40% desperdicio</span>
              <span className="footer-stat">♻️ +10.000 salvados</span>
            </div>
          </div>

          <div className="footer-section">
            <h3>🚴 Trabaja con nosotros</h3>
            <p>
              ¿Quieres ser parte del cambio? Súmate como repartidor EcoSavor y genera 
              ingresos flexibles mientras ayudas a reducir el desperdicio en tu ciudad.
            </p>
            <a href="#" className="footer-cta-btn">
              Postular ahora →
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 EcoSavor — Todos los derechos reservados</span>
          <div className="footer-links">
            <a href="#">Política de privacidad</a>
            <span>·</span>
            <a href="#">Términos de uso</a>
          </div>
        </div>
      </div>
    </div>
  );
}
