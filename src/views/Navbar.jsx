// Navbar - Componente de navegación actualizado
import React, { useState, useEffect } from 'react';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';

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
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

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
              <>
                <button
                  onClick={() => onNavigate('admin')}
                  className={currentView === 'admin' ? 'active' : ''}
                >
                  Gestionar Productos
                </button>
                <button
                  onClick={() => onNavigate('restaurant-orders')}
                  className={currentView === 'restaurant-orders' ? 'active' : ''}
                >
                  Gestionar Órdenes
                </button>
              </>
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
              🛒 Carrito {itemCount > 0 && <span className="cart-count">({itemCount})</span>}
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
              🛒 Carrito {itemCount > 0 && <span className="cart-count">({itemCount})</span>}
            </button>
            <button onClick={() => onNavigate('login')}>Iniciar Sesión</button>
            <button onClick={() => onNavigate('register')} className="btn-primary">Registrarse</button>
          </>
        )}
      </div>
    </nav>
  );
}
