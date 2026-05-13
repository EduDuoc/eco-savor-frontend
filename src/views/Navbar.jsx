// Navbar - Componente de navegación actualizado
import React from 'react';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';
import { useGuestCartViewModel } from '../viewmodels/useGuestCartViewModel';

export function Navbar({ currentView, onNavigate }) {
  const { user, isAuthenticated, logout } = useAuthViewModel();
  const { itemCount } = useGuestCartViewModel();

  const handleLogout = () => {
    logout();
    onNavigate('catalog');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>🥡 EcoSavor</h1>
      </div>
      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            <button
              onClick={() => onNavigate('catalog')}
              className={currentView === 'catalog' ? 'active' : ''}
            >
              Catálogo
            </button>
            {user?.role === 'restaurant' ? (
              <button
                onClick={() => onNavigate('admin')}
                className={currentView === 'admin' ? 'active' : ''}
              >
                Gestionar Productos
              </button>
            ) : (
              <button
                onClick={() => onNavigate('orders')}
                className={currentView === 'orders' ? 'active' : ''}
              >
                Mis Órdenes
              </button>
            )}
            <button
              onClick={() => onNavigate('cart')}
              className="cart-button"
            >
              🛒 {itemCount > 0 ? `(${itemCount})` : ''}
            </button>
            <div className="user-info">
              <span>Hola, {user?.name}</span>
              <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => onNavigate('catalog')}
              className={currentView === 'catalog' ? 'active' : ''}
            >
              Catálogo
            </button>
            <button
              onClick={() => onNavigate('cart')}
              className="cart-button"
            >
              🛒 {itemCount > 0 ? `(${itemCount})` : ''}
            </button>
            <button onClick={() => onNavigate('login')}>Iniciar Sesión</button>
            <button onClick={() => onNavigate('register')} className="btn-primary">Registrarse</button>
          </>
        )}
      </div>
    </nav>
  );
}
