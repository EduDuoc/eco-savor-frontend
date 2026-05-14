// RegisterView - View Layer (MVVM Pattern) - Diseño actualizado 2026
import React, { useState } from 'react';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';

export function RegisterView({ onNavigate }) {
  const { register, loading, error } = useAuthViewModel();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'buyer',
    phone: '',
    restaurantName: '',
    address: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      onNavigate?.('login');
    }
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

      {/* Formulario de Registro */}
      <div className="login-container">
        <div className="login-card" style={{ maxWidth: '480px' }}>
          <h1 style={{ fontSize: '1.75rem', color: '#064e3b', marginBottom: '1.5rem' }}>Crear Cuenta</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre completo:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Tu nombre"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="tu@email.com"
              />
            </div>
            <div className="form-group">
              <label>Contraseña:</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label>Tipo de cuenta:</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{ width: '100%', padding: '0.875rem 1rem', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem' }}
              >
                <option value="buyer">🛒 Comprador</option>
                <option value="restaurant">🏪 Restaurante</option>
              </select>
            </div>
            {formData.role === 'restaurant' && (
              <div className="form-group">
                <label>Nombre del restaurante:</label>
                <input
                  type="text"
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                  required={formData.role === 'restaurant'}
                  placeholder="Ej: Pizza Hut"
                />
              </div>
            )}
            <div className="form-group">
              <label>Teléfono:</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+56 9 1234 5678"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary"
              style={{ marginTop: '1rem' }}
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>
          
          <p className="auth-link" style={{ marginTop: '1.5rem', textAlign: 'center', color: '#64748b' }}>
            ¿Ya tenés cuenta?{' '}
            <button onClick={() => onNavigate?.('login')} className="btn-link">
              Iniciá sesión
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
