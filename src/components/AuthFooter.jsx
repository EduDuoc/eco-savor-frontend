// AuthFooter - Componente reutilizable para Login y Register Views
import React from 'react';
import './AuthFooter.css';

export function AuthFooter() {
  return (
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
  );
}
