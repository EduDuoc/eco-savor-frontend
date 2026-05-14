// Navbar - Componente de navegación - Diseño actualizado 2026
import React, { useState, useEffect } from 'react';
import { useAuthViewModel } from '../modules/index.js';

const CART_KEY = 'ecosavor_guest_cart';

export function Navbar({ currentView, onNavigate }) {
  const { user, isAuthenticated, logout } = useAuthViewModel();
  const [itemCount, setItemCount] = useState(0);
  
  // Leer carrito desde localStorage y actualizar contador
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
    
    // Actualizar al montar
    updateCartCount();
    
    // Escuchar cambios en localStorage (solo entre pestañas)
    window.addEventListener('storage', updateCartCount);
    
    // Escuchar evento personalizado (misma pestaña - cuando el ViewModel actualiza)
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
            ) : (
              <button
                onClick={() => onNavigate('orders')}
                className={currentView === 'orders' ? 'active' : ''}
              >
                Mis pedidos
              </button>
            )}
            <button
              onClick={() => onNavigate('cart')}
              className="cart-button"
            >
              🛒 Carrito {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
            </button>
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
