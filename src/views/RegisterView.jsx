// RegisterView - View Layer (MVVM Pattern)
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
    <div className="auth-container">
      <div className="auth-card">
        <h1>Crear Cuenta</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña:</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Tipo de cuenta:</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="buyer">Comprador</option>
              <option value="restaurant">Restaurante</option>
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
              />
            </div>
          )}
          <div className="form-group">
            <label>Teléfono:</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>
        <p className="auth-link">
          ¿Ya tenés cuenta?{' '}
          <button onClick={() => onNavigate?.('login')} className="btn-link">
            Iniciá sesión
          </button>
        </p>
      </div>
    </div>
  );
}
