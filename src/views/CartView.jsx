// CartView - Vista del carrito para invitados y usuarios
import React from 'react';
import { useGuestCartViewModel } from '../viewmodels/useGuestCartViewModel';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';
import { useOrdersViewModel } from '../viewmodels/useOrdersViewModel';

export function CartView({ onNavigate }) {
  const { cartItems, total, removeFromCart, updateQuantity, clearCart } = useGuestCartViewModel();
  const { isAuthenticated } = useAuthViewModel();
  const { createOrder } = useOrdersViewModel();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert('Para finalizar la compra, debés iniciar sesión o registrarte');
      onNavigate?.('login');
      return;
    }

    // Crear orden por cada producto
    for (const item of cartItems) {
      const orderData = {
        productId: item._id || item.id,
        productName: item.name,
        quantity: item.quantity || 1,
        totalPrice: (item.discountedPrice || item.price || 0) * (item.quantity || 1),
        expiresAt: item.expiresAt || new Date(Date.now() + 86400000),
      };

      const result = await createOrder(orderData);
      if (!result.success) {
        alert(`Error al reservar ${item.name}: ${result.error}`);
        return;
      }
    }

    alert('¡Reserva creada con éxito!');
    clearCart();
    onNavigate?.('orders');
  };

  if (cartItems.length === 0) {
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
        {cartItems.map((item) => (
          <div key={item._id || item.id} className="cart-item">
            <div className="cart-item-info">
              <h3>{item.name}</h3>
              <p className="cart-item-price">
                ${item.discountedPrice || item.price} x {item.quantity || 1}
              </p>
            </div>
            <div className="cart-item-actions">
              <button
                onClick={() => updateQuantity(item._id || item.id, (item.quantity || 1) - 1)}
                className="btn-small"
              >
                -
              </button>
              <span>{item.quantity || 1}</span>
              <button
                onClick={() => updateQuantity(item._id || item.id, (item.quantity || 1) + 1)}
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
        <button onClick={handleCheckout} className="btn-primary btn-large">
          {isAuthenticated ? 'Finalizar Compra' : 'Iniciar Sesión para Comprar'}
        </button>
      </div>
    </div>
  );
}
