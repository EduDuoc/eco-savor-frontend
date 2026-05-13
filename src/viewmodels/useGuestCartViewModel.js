// ViewModel para Carrito de Invitados (MVVM Pattern)
import { useState, useCallback, useEffect } from 'react';

const CART_KEY = 'ecosavor_guest_cart';

export function useGuestCartViewModel() {
  const [cartItems, setCartItems] = useState(() => {
    // Cargar inicial desde localStorage
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Escuchar cambios en localStorage (sincronización entre componentes/pestañas)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === CART_KEY) {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : [];
          setCartItems(parsed);
        } catch (err) {
          console.error('Error parsing cart from storage event:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Guardar en localStorage cuando cambia el estado
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Agregar producto al carrito (con validación de stock)
  const addToCart = useCallback((product) => {
    const availableStock = product.stock || product.quantity || 0;
    
    // Verificar stock actual en el carrito
    const existingItem = cartItems.find(
      (item) => item._id === product._id || item.id === product._id
    );
    const currentQty = existingItem?.quantity || 0;
    
    // Validar que no se exceda el stock
    if (currentQty + 1 > availableStock) {
      return { 
        success: false, 
        error: `Solo hay ${availableStock} unidades disponibles` 
      };
    }
    
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item._id === product._id || item.id === product._id
      );
      
      let updated;
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (updated[existingIndex].quantity || 1) + 1
        };
      } else {
        updated = [...prev, { ...product, quantity: 1 }];
      }
      
      return updated;
    });
    
    return { success: true };
  }, [cartItems]);

  // Remover producto del carrito
  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item._id !== productId && item.id !== productId);
      return updated;
    });
  }, []);

  // Actualizar cantidad (con validación de stock)
  const updateQuantity = useCallback((productId, quantity, maxStock = 0) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }
    
    // Validar que no se exceda el stock máximo
    if (maxStock > 0 && quantity > maxStock) {
      return { 
        success: false, 
        error: `Solo hay ${maxStock} unidades disponibles` 
      };
    }
    
    setCartItems((prev) => {
      const updated = prev.map((item) =>
        item._id === productId || item.id === productId
          ? { ...item, quantity }
          : item
      );
      return updated;
    });
    
    return { success: true };
  }, [removeFromCart]);

  // Limpiar carrito
  const clearCart = useCallback(() => {
    setCartItems([]);
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
