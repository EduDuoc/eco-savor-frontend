// LoginView - View Layer (MVVM Pattern)
import React, { useState } from 'react';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';

export function LoginView({ onNavigate }) {
  const { login, loading, error } = useAuthViewModel();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) {
      onNavigate?.('catalog');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Iniciar Sesión</h1>
        <form onSubmit={handleSubmit}>
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
              placeholder="********"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Iniciando...' : 'Ingresar'}
          </button>
        </form>
        <p className="auth-link">
          ¿No tenés cuenta?{' '}
          <button onClick={() => onNavigate?.('register')} className="btn-link">
            Registrate
          </button>
        </p>
      </div>
    </div>
  );
}
