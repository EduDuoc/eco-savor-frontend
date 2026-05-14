// CartView - Vista del carrito para invitados y usuarios (MVVM - View Only)
import React from 'react';
import { useGuestCartViewModel } from '../modules/index.js';

export function CartView({ onNavigate }) {
  const {
    cartItems,
    total,
    customerPhone,
    notes,
    pickupTime,
    isCheckingOut,
    removeFromCart,
    updateQuantity,
    updateCustomerPhone,
    updateNotes,
    updatePickupTime,
    checkout,
  } = useGuestCartViewModel();

  const displayItems = cartItems;

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

  const handleCheckout = async () => {
    const result = await checkout(onNavigate);
    if (!result.success) {
      alert(result.error);
    }
  };

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
            onChange={(e) => updateCustomerPhone(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '0.9rem'
            }}
          />
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            🕐 Hora de retiro (requerido)
          </label>
          <input
            type="datetime-local"
            value={pickupTime}
            onChange={(e) => updatePickupTime(e.target.value)}
            required
            min={new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)}
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
            onChange={(e) => updateNotes(e.target.value)}
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
          {isCheckingOut ? '⏳ Procesando orden...' : 'Finalizar Orden'}
        </button>
      </div>
    </div>
  );
}
