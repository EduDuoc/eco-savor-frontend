// ViewModel para Carrito de Invitados (MVVM Pattern)
import { useState, useCallback, useEffect } from 'react';

const CART_KEY = 'ecosavor_guest_cart';

export function useGuestCartViewModel() {
  const [cartItems, setCartItems] = useState([]);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_KEY);
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error al cargar carrito:', e);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Agregar producto al carrito
  const addToCart = useCallback((product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id || item.id === product._id);
      if (existing) {
        // Ya existe, aumentar cantidad
        return prev.map((item) =>
          item._id === product._id || item.id === product._id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      // Nuevo producto
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  // Remover producto del carrito
  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId && item.id !== productId));
  }, []);

  // Actualizar cantidad
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === productId || item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  // Limpiar carrito (usado después de login/registro)
  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  // Obtener total
  const total = cartItems.reduce((sum, item) => {
    const price = item.discountedPrice || item.price || 0;
    const qty = item.quantity || 1;
    return sum + price * qty;
  }, 0);

  const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return {
    // Estado
    cartItems,
    total,
    itemCount,

    // Acciones
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}
