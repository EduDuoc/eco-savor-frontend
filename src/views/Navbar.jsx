// Navbar - Componente de navegación - Diseño actualizado 2026
import React, { useState, useEffect } from 'react';
import { useAuthViewModel } from '../modules/index.js';

const CART_KEY = 'ecosavor_guest_cart';

export function Navbar({ currentView, onNavigate }) {
  const { user, isAuthenticated, logout } = useAuthViewModel();
  const [itemCount, setItemCount] = useState(0);
  
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const savedCart = localStorage.getItem(CART_KEY);
        if (savedCart) {
          const cart = JSON.parse(savedCart);
          const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
          setItemCount(count);
        } else {
          setItemCount(0);
        }
      } catch (e) {
        console.error('Error al leer carrito:', e);
        setItemCount(0);
      }
    };
    
    updateCartCount();
    
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-changed', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-changed', updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    logout();
    onNavigate('catalog');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-brand-logo">🌿</span>
        <h1>EcoSavor</h1>
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
              <>
                <button
                  onClick={() => onNavigate('admin')}
                  className={currentView === 'admin' ? 'active' : ''}
                >
                  Gestionar productos
                </button>
                <button
                  onClick={() => onNavigate('restaurant-orders')}
                  className={currentView === 'restaurant-orders' ? 'active' : ''}
                >
                  Gestionar órdenes
                </button>
              </>
            ) : user?.role === 'admin' ? (
              <>
                <button
                  onClick={() => onNavigate('admin-dashboard-stores')}
                  className={currentView === 'admin-dashboard-stores' ? 'active' : ''}
                >
                  🏪 Panel Tiendas
                </button>
                <button
                  onClick={() => onNavigate('admin-dashboard-customers')}
                  className={currentView === 'admin-dashboard-customers' ? 'active' : ''}
                >
                  👥 Panel Clientes
                </button>
                <button
                  onClick={() => onNavigate('admin-feedback')}
                  className={currentView === 'admin-feedback' ? 'active' : ''}
                >
                  Felicitaciones
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('orders')}
                className={currentView === 'orders' ? 'active' : ''}
              >
                Mis pedidos
              </button>
            )}
            {user?.role !== 'admin' && (
              <button
                onClick={() => onNavigate('cart')}
                className="cart-button"
              >
                🛒 Carrito {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
              </button>
            )}
            <div className="user-info">
              <span>Hola, {user?.name || user?.email || 'Usuario'}</span>
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
              🛒 Carrito {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
