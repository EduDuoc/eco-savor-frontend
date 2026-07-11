// AuthHeader - Componente reutilizable para Login y Register Views
import React from 'react';

export function AuthHeader() {
  return (
    <div className="login-header">
      <div className="login-header-logo">🌿</div>
      <h1>EcoSavor</h1>
      <p className="login-header-tagline">¿Tienes hambre? Compra, ahorra y ayuda al planeta 🌱</p>
      <p className="login-header-quote">
        "Cada producto que salvas es un paso hacia un planeta más limpio 🌍"
      </p>
    </div>
  );
}
