// AuthFooter - Componente reutilizable para Login y Register Views
import React, { useState } from 'react';
import './AuthFooter.css';
import { FeedbackForm } from './FeedbackForm';

export function AuthFooter({ onManagerAccess }) {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="login-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>EcoSavor</h3>
          <p>
            Plataforma de reduccion de desperdicio alimentario. Conectamos comercios 
            con productos proximos a vencer con consumidores que quieren ahorrar y 
            cuidar el planeta.
          </p>
          {onManagerAccess && (
            <button
              onClick={onManagerAccess}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.7)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                marginTop: '10px',
              }}
            >
              Acceso Gerencial
            </button>
          )}
        </div>
        <div className="footer-section">
          <h3>Nuestra mision</h3>
          <p>
            Reducir el desperdicio alimentario en Chile, dando una segunda oportunidad 
            a alimentos en perfecto estado. Cada compra en EcoSavor es un aporte al 
            medioambiente.
          </p>
          <div className="footer-stats">
            <span className="footer-stat">-40% desperdicio</span>
            <span className="footer-stat">+10.000 salvados</span>
          </div>
        </div>
        <div className="footer-section">
          <h3>Trabaja con nosotros</h3>
          <p>
            Quieres ser parte del cambio? Sumate como repartidor EcoSavor y genera 
            ingresos flexibles mientras ayudas a reducir el desperdicio en tu ciudad.
          </p>
          <a href="#" className="footer-cta-btn">
            Postular ahora
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>2026 EcoSavor - Todos los derechos reservados</span>
        <button
          onClick={() => setShowFeedback(true)}
          style={{
            background: '#1D9E75',
            border: 'none',
            color: '#fff',
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Mejoras y Felicitaciones
        </button>
        <div className="footer-links">
          <a href="#">Politica de privacidad</a>
          <span>-</span>
          <a href="#">Terminos de uso</a>
        </div>
      </div>
      {showFeedback && <FeedbackForm onClose={() => setShowFeedback(false)} />}
    </div>
  );
}