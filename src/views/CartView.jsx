// CartView - Vista del carrito - Diseño actualizado 2026
import React, { useState } from 'react';
import { useGuestCartViewModel } from '../modules/index.js';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';

export function CartView({ onNavigate, onSuccess }) {
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
  
  const { user } = useAuthViewModel();

  const displayItems = cartItems;

  if (displayItems.length === 0) {
    return (
      <div className="cart-container">
        <h1>Tu carrito</h1>
        <div className="no-orders">
          <div className="no-orders-icon">🛒</div>
          <h2>Carrito vacío</h2>
          <p>Agrega productos del catálogo para comenzar</p>
        </div>
        <button 
          onClick={() => onNavigate?.('catalog')} 
          className="btn-primary"
          style={{ marginTop: '2rem' }}
        >
          Ver Catálogo
        </button>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!pickupTime) {
      alert('Por favor, indicá la hora de retiro');
      return;
    }
    
    const result = await checkout(onNavigate);
    if (result.success) {
      // Pasar los datos de la orden a la vista de éxito
      onSuccess?.({
        total: total,
        email: user?.email
      });
    } else {
      alert(result.error);
    }
  };

  const getEmojiForProduct = (item) => {
    const nameLower = item.name?.toLowerCase() || '';
    
    if (nameLower.includes('palta') || nameLower.includes('aguacate')) return '🥑';
    if (nameLower.includes('tomate')) return '🍅';
    if (nameLower.includes('manzana')) return '🍎';
    if (nameLower.includes('zanahoria')) return '🥕';
    if (nameLower.includes('pizza')) return '🍕';
    if (nameLower.includes('sushi')) return '🍣';
    if (nameLower.includes('burger') || nameLower.includes('hamburguesa')) return '🍔';
    if (nameLower.includes('pan')) return '🍞';
    
    return '🥡';
  };

  return (
    <div className="cart-container">
      <h1>Tu carrito</h1>
      
      <div className="cart-items">
        {displayItems.map((item) => (
          <div key={item._id || item.id} className="cart-item">
            <div className="cart-item-info">
              <span className="cart-item-emoji">{getEmojiForProduct(item)}</span>
              <div>
                <h3>{item.name}</h3>
                <p className="cart-item-price">${(item.discountedPrice || item.price).toLocaleString('es-CL')} c/u</p>
              </div>
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
              >
                −
              </button>
              <span>{item.quantity || 1}</span>
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
              >
                +
              </button>
              <button
                onClick={() => removeFromCart(item._id || item.id)}
                className="btn-delete"
                style={{ marginLeft: '0.5rem' }}
              >
                Eliminar
              </button>
            </div>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#064e3b',
              minWidth: '100px',
              textAlign: 'right'
            }}>
              ${((item.discountedPrice || item.price) * (item.quantity || 1)).toLocaleString('es-CL')}
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', color: '#064e3b' }}>Total</h2>
        <h2 style={{ fontSize: '2rem', color: '#064e3b', fontWeight: '700' }}>
          ${total.toLocaleString('es-CL')}
        </h2>
      </div>

      {/* Información del cliente */}
      <div className="payment-methods">
        <h3>Datos para el retiro</h3>
        
        <div className="customer-info">
          <label>
            📞 Teléfono de contacto (opcional)
          </label>
          <input
            type="tel"
            placeholder="+56 9 1234 5678"
            value={customerPhone}
            onChange={(e) => updateCustomerPhone(e.target.value)}
          />
          
          <label>
            🕐 Hora de retiro (requerido)
          </label>
          <input
            type="datetime-local"
            value={pickupTime}
            onChange={(e) => updatePickupTime(e.target.value)}
            required
            min={new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)}
          />
          
          <label>
            📝 Notas para el restaurante (opcional)
          </label>
          <textarea
            placeholder="Ej: Sin cebolla, timbre no funciona, etc."
            value={notes}
            onChange={(e) => updateNotes(e.target.value)}
            rows="2"
          />
        </div>

        <button 
          onClick={handleCheckout} 
          className="btn-primary btn-large"
          disabled={isCheckingOut}
          style={{
            opacity: isCheckingOut ? 0.7 : 1,
            cursor: isCheckingOut ? 'not-allowed' : 'pointer',
            marginTop: '1rem'
          }}
        >
          {isCheckingOut ? '⏳ Procesando orden...' : 'Confirmar pedido'}
        </button>
      </div>
    </div>
  );
}
