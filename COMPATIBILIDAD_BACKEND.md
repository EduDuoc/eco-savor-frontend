# 🔧 Ajustes Frontend para Compatibilidad con Backend

## ✅ Lo que YA está bien

- ✅ Estructura MVVM con ViewModels
- ✅ Contexto global para estado
- ✅ Carrito local en localStorage
- ✅ Axios instalado (aunque usan fetch)
- ✅ Vistas separadas por rol (Catalog/Admin)

---

## ⚠️ Problemas Detectados y Soluciones

### 1. **Falta Interceptor de Autenticación**

**Problema**: Cada ViewModel maneja el token manualmente con `localStorage.getItem('token')`. Si el token expira (401), no hay manejo centralizado.

**Solución**: Crear `src/services/api.js` con axios interceptors.

```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Luego actualizar los ViewModels** para usar `api` en vez de `fetch`.

---

### 2. **useProductsViewModel - Endpoint Incorrecto**

**Problema**: El backend devuelve `{ success: true, data: [...] }`, el frontend espera `{ products: [...] }`.

**Solución**: Actualizar `loadProducts()`:

```javascript
// ANTES (línea 29)
dispatch({ type: ActionTypes.SET_PRODUCTS, payload: data.products || data });

// DESPUÉS
dispatch({ 
  type: ActionTypes.SET_PRODUCTS, 
  payload: data.data || data.products || data 
});
```

**Además**: Agregar filtro por `available=true` para solo mostrar productos disponibles:

```javascript
// loadProducts() - línea 17
const response = await api.get('/catalog/products', {
  params: { available: 'true' }
});
```

---

### 3. **useOrdersViewModel - Endpoints Incorrectos**

**Problema 1**: `GET /orders/my-orders` no existe en el backend.

**Solución**: El backend usa `GET /orders` y filtra automáticamente según el rol del usuario.

```javascript
// getMyOrders() - línea 49-58
const getMyOrders = useCallback(async () => {
  dispatch({ type: ActionTypes.SET_LOADING, payload: true });
  setLocalError(null);

  try {
    const response = await api.get('/orders');
    // El backend filtra automáticamente según el rol
    
    dispatch({ type: ActionTypes.SET_ORDERS, payload: response.data.data || response.data });
    return { success: true };
  } catch (error) {
    setLocalError(error.message);
    dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    return { success: false, error: error.message };
  } finally {
    dispatch({ type: ActionTypes.SET_LOADING, payload: false });
  }
}, [dispatch]);
```

**Problema 2**: `POST /orders/:id/cancel` usa método `PATCH`, el backend usa `POST`.

```javascript
// cancelOrder() - línea 78-88
const response = await api.post(`/orders/${orderId}/cancel`);
```

---

### 4. **CartView - Estructura de Orden Incorrecta**

**Problema**: El carrito crea órdenes con estructura vieja (`productId`, `productName`), el backend espera `items: []` con múltiples productos.

**Backend espera:**
```json
{
  "items": [
    {
      "productId": "...",
      "name": "Pizza",
      "price": 5000,
      "quantity": 2,
      "restaurantId": "...",
      "restaurantName": "El Restaurante"
    }
  ],
  "totalAmount": 10000,
  "customerName": "Juan",
  "customerPhone": "123456789"
}
```

**Solución**: Reescribir `handleCheckout()` en `CartView.jsx`:

```javascript
const handleCheckout = async () => {
  if (!isAuthenticated) {
    alert('Para finalizar la compra, debés iniciar sesión o registrarte');
    onNavigate?.('login');
    return;
  }

  // VALIDAR: Todos los items deben ser del mismo restaurante
  const restaurantIds = [...new Set(cartItems.map(item => item.restaurantId))];
  if (restaurantIds.length > 1) {
    alert('Tu carrito tiene productos de diferentes restaurantes. Por favor, completá la compra de un solo restaurante por vez.');
    return;
  }

  // VALIDAR: Stock suficiente
  for (const item of cartItems) {
    if (item.quantity > (item.maxStock || item.quantity)) {
      alert(`Stock insuficiente para ${item.name}. Máximo disponible: ${item.maxStock || item.quantity}`);
      return;
    }
  }

  // Crear orden con TODOS los items del carrito
  const orderData = {
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
    customerPhone: user?.phone || '',
    notes: ''
  };

  const result = await createOrder(orderData);
  
  if (result.success) {
    alert('¡Orden creada exitosamente!');
    clearCart();
    onNavigate?.('orders');
  } else {
    // Manejar error de stock (409)
    if (result.error?.includes('Stock')) {
      alert(`Error de stock: ${result.error}`);
    } else {
      alert(`Error al crear orden: ${result.error}`);
    }
  }
};
```

---

### 5. **AdminView - restaurantId Hardcodeado**

**Problema**: Línea 48 usa `user?.id || user?._id || 'restaurant-001'`. El backend ahora auto-asigna `restaurantId` desde el token.

**Solución**: Simplemente NO enviar `restaurantId` en el body. El middleware `ownership.js` lo asigna automáticamente.

```javascript
// handleSubmit() - líneas 27-50
const productData = {
  name: formData.name,
  description: formData.description,
  price: price,
  discountPrice: discountPrice,
  quantity: parseInt(formData.quantity) || 0,
  category: formData.category,
  expiresAt: new Date(formData.expiresAt),
  images: formData.imageUrl ? [formData.imageUrl] : [],
  // NO enviar restaurantId ni restaurantName - el backend lo asigna del token
};
```

---

### 6. **Falta Manejo de Errores 409 (Stock Insuficiente)**

**Solución**: En `useOrdersViewModel`, manejar error 409:

```javascript
// createOrder() - después de línea 28
if (!response.ok) {
  if (response.status === 409) {
    throw new Error('Stock insuficiente para algunos productos. Por favor revisá tu carrito.');
  }
  throw new Error(data.error || 'Error al crear orden');
}
```

---

### 7. **Falta Vista de Gestión de Órdenes para Restaurant**

**Problema**: `AdminView` solo tiene CRUD de productos. Falta ver/gestionar órdenes del restaurante.

**Solución**: Crear `src/views/RestaurantOrdersView.jsx`:

```javascript
// src/views/RestaurantOrdersView.jsx
import React, { useEffect, useState } from 'react';
import { useOrdersViewModel } from '../viewmodels/useOrdersViewModel';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';

export function RestaurantOrdersView() {
  const { orders, getMyOrders, cancelOrder, loading, error } = useOrdersViewModel();
  const { user } = useAuthViewModel();
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    getMyOrders();
  }, [getMyOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    // Implementar según endpoints del backend:
    // /orders/:id/confirm, /orders/:id/preparing, /orders/:id/ready, /orders/:id/complete
    // Esto requiere agregar métodos en useOrdersViewModel
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  return (
    <div className="restaurant-orders-container">
      <h1>Órdenes del Restaurante</h1>
      
      <div className="status-filters">
        <button onClick={() => setFilterStatus('all')}>Todas</button>
        <button onClick={() => setFilterStatus('pending')}>Pendientes</button>
        <button onClick={() => setFilterStatus('confirmed')}>Confirmadas</button>
        <button onClick={() => setFilterStatus('preparing')}>En Preparación</button>
        <button onClick={() => setFilterStatus('ready')}>Listas</button>
        <button onClick={() => setFilterStatus('completed')}>Completadas</button>
      </div>

      {loading && <div className="loading">Cargando...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="orders-list">
        {filteredOrders.map(order => (
          <div key={order._id} className="order-card">
            <h3>Orden #{order._id.slice(-6)}</h3>
            <p>Cliente: {order.customerName}</p>
            <p>Items: {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
            <p>Total: ${order.totalAmount}</p>
            <p>Estado: {order.status}</p>
            
            {/* Botones de acción según estado */}
            {order.status === 'pending' && (
              <button onClick={() => handleStatusChange(order._id, 'confirm')}>
                Confirmar Orden
              </button>
            )}
            {order.status === 'confirmed' && (
              <button onClick={() => handleStatusChange(order._id, 'preparing')}>
                En Preparación
              </button>
            )}
            {order.status === 'preparing' && (
              <button onClick={() => handleStatusChange(order._id, 'ready')}>
                Lista para Retirar
              </button>
            )}
            {order.status === 'ready' && (
              <button onClick={() => handleStatusChange(order._id, 'complete')}>
                Completar
              </button>
            )}
            {(order.status === 'pending' || order.status === 'confirmed') && (
              <button onClick={() => cancelOrder(order._id)} className="btn-danger">
                Cancelar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 8. **AppContext - Agregar Acción para Actualizar Órdenes**

**Problema**: Solo hay `ADD_ORDER`, no hay forma de actualizar una orden existente (cuando cambia de estado).

**Solución**: Agregar `UPDATE_ORDER` al reducer:

```javascript
// AppContext.js - línea 14-24
const ActionTypes = {
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_ORDERS: 'SET_ORDERS',
  ADD_ORDER: 'ADD_ORDER',
  UPDATE_ORDER: 'UPDATE_ORDER',  // ← AGREGAR
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer - después de ADD_ORDER (línea 38)
case ActionTypes.ADD_ORDER:
  return { ...state, orders: [...state.orders, action.payload] };
case ActionTypes.UPDATE_ORDER:  // ← AGREGAR
  return {
    ...state,
    orders: state.orders.map(order =>
      order._id === action.payload._id ? action.payload : order
    )
  };
```

---

### 9. **useAuthViewModel - Cargar Usuario al Iniciar**

**Problema**: El usuario solo se carga al hacer login. Si recargan la página, el token está en localStorage pero el usuario no.

**Solución**: Agregar método para cargar usuario desde token:

```javascript
// useAuthViewModel.js - después de logout (línea 77)
const loadUserFromToken = useCallback(() => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      // Decodificar JWT para obtener usuario
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      
      dispatch({
        type: ActionTypes.SET_USER,
        payload: { 
          user: { 
            id: payload.sub, 
            email: payload.email, 
            role: payload.role 
          }, 
          token 
        },
      });
    } catch (e) {
      console.error('Token inválido:', e);
      localStorage.removeItem('token');
    }
  }
}, [dispatch]);

// Llamar al montar el componente
useEffect(() => {
  loadUserFromToken();
}, [loadUserFromToken]);
```

---

## 📋 Checklist de Cambios

- [ ] Crear `src/services/api.js` con axios interceptors
- [ ] Actualizar `useProductsViewModel` para usar `api` y manejar respuesta `{ data: [...] }`
- [ ] Actualizar `useOrdersViewModel` para usar `api` y endpoints correctos
- [ ] Reescribir `CartView.jsx` `handleCheckout()` para enviar estructura correcta
- [ ] Limpiar `AdminView.jsx` - no enviar `restaurantId` en createProduct
- [ ] Agregar `UPDATE_ORDER` en `AppContext.js`
- [ ] Agregar `loadUserFromToken()` en `useAuthViewModel.js`
- [ ] Crear `RestaurantOrdersView.jsx` para gestión de órdenes
- [ ] Agregar métodos en `useOrdersViewModel` para cambiar estados (confirm, preparing, ready, complete)
- [ ] Actualizar `App.js` para incluir nueva vista `RestaurantOrdersView`

---

## 🚀 Comandos para Probar

```bash
# Terminal 1 - Backend
cd /mnt/c/Users/delga/OneDrive/Escritorio/Repositorio/Eco-Savor/ecosavor-backend
docker compose up --build

# Terminal 2 - Frontend
cd /mnt/c/Users/delga/OneDrive/Escritorio/Repositorio/Eco-Savor/ecosavor-frontend
npm install
npm start
```

---

## ✅ Flujo de Prueba Recomendado

1. **Registro de restaurante** → `/register` (rol: restaurant)
2. **Login restaurante** → Crear 2-3 productos
3. **Logout** → Ir a `/register` (rol: buyer)
4. **Login buyer** → Ver catálogo → Agregar productos al carrito
5. **Finalizar compra** → Verificar que se cree orden correctamente
6. **Logout** → Login restaurante → Ver órdenes recibidas
7. **Gestionar orden** → Confirmar → En preparación → Lista → Completada
8. **Logout** → Login buyer → Ver mis órdenes → Cancelar una pendiente

---

**Importante**: El backend YA está funcionando. Estos ajustes son para que el frontend sea compatible con los endpoints y estructuras actuales.
