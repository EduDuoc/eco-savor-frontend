// ViewModel para Carrito de Invitados (MVVM Pattern)
import { useState, useCallback, useEffect } from 'react';
import { useAuthViewModel } from './useAuthViewModel';
import { useOrdersViewModel } from './useOrdersViewModel';

const CART_KEY = 'ecosavor_guest_cart';

export function useGuestCartViewModel() {
  const { isAuthenticated, user } = useAuthViewModel();
  const { createOrder } = useOrdersViewModel();
  
  const [cartItems, setCartItems] = useState(() => {
    // Cargar inicial desde localStorage
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Estado local para checkout
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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

  // ==================== LÓGICA DE CHECKOUT (MVVM - Business Logic) ====================

  // Validar que el carrito no esté vacío
  const validateCartNotEmpty = useCallback(() => {
    if (cartItems.length === 0) {
      return { valid: false, error: 'El carrito está vacío' };
    }
    return { valid: true };
  }, [cartItems]);

  // Validar autenticación
  const validateAuth = useCallback(() => {
    if (!isAuthenticated) {
      return { valid: false, error: 'Debes iniciar sesión para comprar' };
    }
    return { valid: true };
  }, [isAuthenticated]);

  // Validar que todos los items sean del mismo restaurante
  const validateSingleRestaurant = useCallback(() => {
    const restaurantIds = [...new Set(cartItems.map(item => item.restaurantId))];
    if (restaurantIds.length > 1) {
      return { 
        valid: false, 
        error: 'Tu carrito tiene productos de diferentes restaurantes. Por favor, completá la compra de un solo restaurante por vez.' 
      };
    }
    return { valid: true };
  }, [cartItems]);

  // Validar stock suficiente para todos los items
  const validateStock = useCallback(() => {
    for (const item of cartItems) {
      const availableStock = item.stock || item.quantity || 0;
      if (item.quantity > availableStock) {
        return { 
          valid: false, 
          error: `⚠️ Stock insuficiente para ${item.name}. Solo hay ${availableStock} unidades disponibles.` 
        };
      }
    }
    return { valid: true };
  }, [cartItems]);

  // Preparar datos de la orden
  const prepareOrderData = useCallback(() => {
    const defaultPickupTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    
    return {
      items: cartItems.map(item => ({
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
      notes: notes || '',
      pickupTime: pickupTime || defaultPickupTime,
      orderType: 'standard',
      scheduledTime: null
    };
  }, [cartItems, total, customerPhone, notes, pickupTime, user]);

  // Ejecutar checkout
  const checkout = useCallback(async (onNavigate) => {
    // Prevenir múltiples clicks
    if (isCheckingOut) {
      return { success: false, error: 'Ya se está procesando una orden' };
    }

    // Validaciones en orden (primera que falla corta)
    const authValidation = validateAuth();
    if (!authValidation.valid) {
      onNavigate?.('login');
      return { success: false, error: authValidation.error };
    }

    const restaurantValidation = validateSingleRestaurant();
    if (!restaurantValidation.valid) {
      return { success: false, error: restaurantValidation.error };
    }

    const stockValidation = validateStock();
    if (!stockValidation.valid) {
      return { success: false, error: stockValidation.error };
    }

    // Crear orden
    setIsCheckingOut(true);
    
    try {
      const orderData = prepareOrderData();
      console.log('🛒 Checkout - Enviando orden:', orderData);

      const result = await createOrder(orderData);
      
      if (result.success) {
        console.log('🛒 Checkout - Orden creada con éxito');
        clearCart();
        onNavigate?.('orders');
        return { success: true, data: result.data };
      } else {
        console.error('🛒 Checkout - Error al crear orden:', result.error);
        if (result.error?.includes('Stock')) {
          return { success: false, error: `Error de stock: ${result.error}` };
        }
        return { success: false, error: `Error al crear orden: ${result.error}` };
      }
    } catch (error) {
      console.error('🛒 Checkout - Error inesperado:', error);
      return { success: false, error: `Error inesperado: ${error.message}` };
    } finally {
      setIsCheckingOut(false);
    }
  }, [isCheckingOut, validateAuth, validateSingleRestaurant, validateStock, prepareOrderData, createOrder, clearCart]);

  // Actualizar campos del formulario
  const updateCustomerPhone = useCallback((phone) => {
    setCustomerPhone(phone);
  }, []);

  const updateNotes = useCallback((notes) => {
    setNotes(notes);
  }, []);

  const updatePickupTime = useCallback((time) => {
    setPickupTime(time);
  }, []);

  return {
    // Estado
    cartItems,
    total,
    itemCount,
    customerPhone,
    notes,
    pickupTime,
    isCheckingOut,

    // Acciones del carrito
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,

    // Acciones de checkout
    checkout,
    updateCustomerPhone,
    updateNotes,
    updatePickupTime,
  };
}
