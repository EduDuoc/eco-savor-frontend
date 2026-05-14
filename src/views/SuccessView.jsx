// SuccessView - Vista de compra exitosa - Diseño actualizado 2026
import React from 'react';
import { useAuthViewModel } from '../modules/index.js';

export function SuccessView({ onNavigate, orderData }) {
  const { user } = useAuthViewModel();
  
  const email = user?.email || 'tu@email.com';
  const total = orderData?.total || 0;

  return (
    <div className="success-container">
      <div className="success-icon">🎉</div>
      <h1>¡Orden creada exitosamente!</h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem' }}>La confirmación fue enviada a</p>
      <p className="success-email">{email}</p>
      
      <div className="success-details">
        <p>
          <span>⏳</span>
          <span>Tu orden está en espera de ser confirmada por el restaurante</span>
        </p>
        <p>
          <span>💰</span>
          <span>Total a pagar: <strong>${total > 0 ? total.toLocaleString('es-CL') : '---'}</strong></span>
        </p>
      </div>
      
      <button 
        onClick={() => onNavigate?.('catalog')} 
        className="btn-continue"
      >
        Seguir explorando →
      </button>
    </div>
  );
}
