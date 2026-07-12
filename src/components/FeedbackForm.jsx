// FeedbackForm - Formulario de Mejoras y Felicitaciones
import React, { useState } from 'react';
import api from '../services/api';

export function FeedbackForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    type: 'general',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/feedback', formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo enviar tu mensaje. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '480px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#64748b',
          }}
        >
          x
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>OK</div>
            <h2 style={{ color: '#059669', marginBottom: '12px' }}>Gracias por tu mensaje</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              Nuestro equipo revisara tu comentario y te contactara pronto para darte una respuesta.
            </p>
            <button
              onClick={onClose}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: '8px', color: '#1f2937' }}>Mejoras y Felicitaciones</h2>
            <p style={{ marginBottom: '20px', color: '#64748b', fontSize: '0.9rem' }}>
              Tu opinion nos ayuda a mejorar. Cuentanos que piensas.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tipo de mensaje</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '12px',
                  }}
                >
                  <option value="general">Comentario general</option>
                  <option value="felicitacion">Felicitacion</option>
                  <option value="mejora">Sugerencia de mejora</option>
                </select>
              </div>

              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Tu nombre"
                />
              </div>

              <div className="form-group">
                <label>Correo</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="tu@correo.com"
                />
              </div>

              <div className="form-group">
                <label>Numero (opcional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div className="form-group">
                <label>Tu mensaje</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={4}
                  placeholder="Cuentanos tu experiencia..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ marginTop: '12px', width: '100%' }}
              >
                {loading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}