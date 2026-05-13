// CartView - Vista del carrito para invitados y usuarios
import React, { useState } from 'react';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';
import { useOrdersViewModel } from '../viewmodels/useOrdersViewModel';
import { useGuestCartViewModel } from '../viewmodels/useGuestCartViewModel';

const CART_KEY = 'ecosavor_guest_cart';

export function CartView({ onNavigate }) {
  const { isAuthenticated, user } = useAuthViewModel();
  const { createOrder } = useOrdersViewModel();
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useGuestCartViewModel();
  
  // Estados para datos del cliente
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Usar cartItems directamente del ViewModel (ya está sincronizado con localStorage)
  const displayItems = cartItems;
  
  // Calcular total desde displayItems
  const total = displayItems.reduce((sum, item) => {
    const price = item.discountedPrice || item.price || 0;
    const qty = item.quantity || 1;
    return sum + price * qty;
  }, 0);
  
  const handleCheckout = async () => {
    // Prevenir múltiples clicks
    if (isCheckingOut) {
      return;
    }
    
    if (!isAuthenticated) {
      alert('Para finalizar la compra, debés iniciar sesión o registrarte');
      onNavigate?.('login');
      return;
    }

    // VALIDAR: Todos los items deben ser del mismo restaurante
    const restaurantIds = [...new Set(displayItems.map(item => item.restaurantId))];
    if (restaurantIds.length > 1) {
      alert('Tu carrito tiene productos de diferentes restaurantes. Por favor, completá la compra de un solo restaurante por vez.');
      return;
    }

    // VALIDAR: Stock suficiente (validación final antes de crear orden)
    for (const item of displayItems) {
      const availableStock = item.stock || item.quantity || 0;
      if (item.quantity > availableStock) {
        alert(`⚠️ Stock insuficiente para ${item.name}. Solo hay ${availableStock} unidades disponibles. Por favor ajustá tu carrito.`);
        return;
      }
    }

    // Crear orden con TODOS los items del carrito
    setIsCheckingOut(true);
    
    try {
      const orderData = {
        items: displayItems.map(item => ({
          productId: item._id || item.id,
          name: item.name,
          price: item.price || item.originalPrice,
          quantity: item.quantity || 1,
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName
        })),
        totalAmount: total,
        customerName: user?.name || 'Cliente',
        customerPhone: customerPhone || user?.phone || '',
        notes: notes || ''
      };

      console.log('🛒 Checkout - Enviando orden:', orderData);

      const result = await createOrder(orderData);
      
      if (result.success) {
        console.log('🛒 Checkout - Orden creada con éxito');
        alert('¡Orden creada exitosamente! La encontrarás en "Mis Órdenes".');
        clearCart();
        onNavigate?.('orders');
      } else {
        console.error('🛒 Checkout - Error al crear orden:', result.error);
        if (result.error?.includes('Stock')) {
          alert(`Error de stock: ${result.error}`);
        } else {
          alert(`Error al crear orden: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('🛒 Checkout - Error inesperado:', error);
      alert(`Error inesperado: ${error.message}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (displayItems.length === 0) {
    return (
      <div className="cart-container">
        <h1>Carrito</h1>
        <p className="empty-cart">Tu carrito está vacío</p>
        <button onClick={() => onNavigate?.('catalog')} className="btn-primary">
          Ver Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Carrito</h1>
      
      <div className="cart-items">
        {displayItems.map((item) => (
          <div key={item._id || item.id} className="cart-item">
            <div className="cart-item-info">
              <h3>{item.name}</h3>
              <p className="cart-item-price">
                ${item.discountedPrice || item.price} x {item.quantity || 1}
              </p>
            </div>
            <div className="cart-item-actions">
              <button
                onClick={() => {
                  const newQty = (item.quantity || 1) - 1;
                  if (newQty <= 0) {
                    removeFromCart(item._id || item.id);
                  } else {
                    updateQuantity(item._id || item.id, newQty);
                  }
                }}
                className="btn-small"
              >
                -
              </button>
              <span>{item.quantity || 1} / {item.stock || item.quantity || '∞'}</span>
              <button
                onClick={() => {
                  const maxStock = item.stock || item.quantity || 999;
                  const newQty = (item.quantity || 1) + 1;
                  if (newQty > maxStock) {
                    alert(`⚠️ Solo hay ${maxStock} unidades disponibles`);
                  } else {
                    updateQuantity(item._id || item.id, newQty, maxStock);
                  }
                }}
                className="btn-small"
              >
                +
              </button>
              <button
                onClick={() => removeFromCart(item._id || item.id)}
                className="btn-small btn-danger"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-total">
        <h2>Total: ${total.toFixed(2)}</h2>
        
        {/* Campos opcionales para el cliente */}
        <div className="customer-info" style={{ marginBottom: '16px' }}>
          <input
            type="tel"
            placeholder="Teléfono de contacto (opcional)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '0.9rem'
            }}
          />
          <textarea
            placeholder="Notas para el restaurante (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="2"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '0.9rem',
              resize: 'vertical'
            }}
          />
        </div>
        
        <button 
          onClick={handleCheckout} 
          className="btn-primary btn-large"
          disabled={isCheckingOut}
          style={{
            opacity: isCheckingOut ? 0.7 : 1,
            cursor: isCheckingOut ? 'not-allowed' : 'pointer'
          }}
        >
          {isCheckingOut ? '⏳ Procesando orden...' : (isAuthenticated ? 'Finalizar Orden' : 'Iniciar Sesión para Comprar')}
        </button>
      </div>
    </div>
  );
}
