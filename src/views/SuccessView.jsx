// SuccessView - Vista de compra exitosa - Diseño actualizado 2026
import React from 'react';
import { useAuthViewModel } from '../modules/index.js';

export function SuccessView({ onNavigate, orderData }) {
  const { user } = useAuthViewModel();
  
  const email = user?.email || 'tu@email.com';
  const total = orderData?.total || 0;
  const estimatedTime = '30-60 minutos';

  return (
    <div className="success-container">
      <div className="success-icon">🎉</div>
      <h1>¡Compra exitosa!</h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem' }}>La confirmación fue enviada a</p>
      <p className="success-email">{email}</p>
      
      <div className="success-details">
        <p>
          <span>🚴</span>
          <span>Tu pedido llegará en {estimatedTime}</span>
        </p>
        <p>
          <span>💰</span>
          <span>Total pagado: <strong>${total > 0 ? total.toLocaleString('es-CL') : '---'}</strong></span>
        </p>
      </div>
      
      <button 
        onClick={() => onNavigate?.('catalog')} 
        className="btn-continue"
      >
        Seguir comprando →
      </button>
    </div>
  );
}
