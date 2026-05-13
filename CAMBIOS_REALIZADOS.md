# ✅ Frontend Actualizado - Cambios Realizados

## Archivos Creados

### 1. `src/services/api.js`
**Propósito**: Axios instance con interceptors para autenticación automática

**Características**:
- Agrega `Authorization: Bearer <token>` en cada request
- Maneja 401 (token expirado) → logout automático
- Maneja 403 (no autorizado) → warning en consola

---

### 2. `src/views/RestaurantOrdersView.jsx`
**Propósito**: Vista para que restaurantes gestionen las órdenes

**Funcionalidades**:
- Lista todas las órdenes del restaurante
- Filtros por estado (pendientes, confirmadas, en preparación, listas, completadas)
- Botones de acción según el estado:
  - `pending` → Confirmar o Cancelar
  - `confirmed` → En Preparación
  - `preparing` → Lista para Retirar
  - `ready` → Completar
- Badges de colores por estado
- Contadores por estado en los filtros

---

## Archivos Actualizados

### 3. `src/viewmodels/useAuthViewModel.js`
**Cambios**:
- ✅ Agrega `loadUserFromToken()` al montar (persistencia de sesión)
- ✅ Usa `api` en vez de `fetch`
- ✅ Maneja errores con `error.response?.data?.error`
- ✅ Guarda `user` en localStorage además del token

### 4. `src/viewmodels/useProductsViewModel.js`
**Cambios**:
- ✅ Usa `api` en vez de `fetch`
- ✅ Agrega `params: { available: 'true' }` para solo productos disponibles
- ✅ Maneja respuesta `{ data: [...] }` del backend
- ✅ Mejora manejo de errores

### 5. `src/viewmodels/useOrdersViewModel.js`
**Cambios**:
- ✅ Usa `api` en vez de `fetch`
- ✅ `getMyOrders()` usa `GET /orders` (backend filtra automáticamente)
- ✅ `cancelOrder()` usa `POST` en vez de `PATCH`
- ✅ Agrega `confirmOrder()` para restaurantes
- ✅ Agrega `markAsPreparing()` para restaurantes
- ✅ Agrega `markAsReady()` para restaurantes
- ✅ Agrega `completeOrder()` para restaurantes
- ✅ Maneja error 409 (stock insuficiente)

### 6. `src/views/CartView.jsx`
**Cambios**:
- ✅ `handleCheckout()` ahora crea UNA orden con TODOS los items
- ✅ Valida que todos los items sean del mismo restaurante
- ✅ Valida stock suficiente antes de enviar
- ✅ Estructura correcta: `{ items: [...], totalAmount, customerName, customerPhone }`

### 7. `src/views/AdminView.jsx`
**Cambios**:
- ✅ NO envía `restaurantId` ni `restaurantName` al crear producto
- ✅ El backend auto-asigna desde el token JWT

### 8. `src/views/Navbar.jsx`
**Cambios**:
- ✅ Agrega botón "Gestionar Órdenes" para restaurantes
- ✅ Navegación a `restaurant-orders` view

### 9. `src/App.js`
**Cambios**:
- ✅ Importa `RestaurantOrdersView`
- ✅ Agrega caso `'restaurant-orders'` en el switch
- ✅ Redirige restaurantes a `restaurant-orders` después de login

### 10. `src/modules/index.js`
**Cambios**:
- ✅ Exporta `RestaurantOrdersView`

### 11. `src/context/AppContext.js`
**Cambios**:
- ✅ Agrega `UPDATE_ORDER` a ActionTypes
- ✅ Agrega caso en reducer para actualizar orden existente

---

## 🧪 Cómo Probar

### 1. Levantar el backend
```bash
cd /mnt/c/Users/delga/OneDrive/Escritorio/Repositorio/Eco-Savor/ecosavor-backend
docker compose up --build
```

### 2. Levantar el frontend
```bash
cd /mnt/c/Users/delga/OneDrive/Escritorio/Repositorio/Eco-Savor/ecosavor-frontend
npm install
npm start
```

### 3. Flujo de Prueba Completo

#### Registro de Restaurante
1. Ir a `/register`
2. Completar datos con rol "restaurant"
3. Ir a login y loguearse

#### Crear Productos
4. Click en "Gestionar Productos"
5. Crear 2-3 productos con stock

#### Registro de Buyer
6. Logout
7. Ir a `/register` con rol "buyer"
8. Login del buyer

#### Comprar
9. Ver catálogo → Agregar productos al carrito
10. Click en carrito → Finalizar compra
11. Verificar que se crea la orden correctamente

#### Gestionar Orden (Restaurante)
12. Logout → Login del restaurante
13. Click en "Gestionar Órdenes"
14. Ver orden pendiente → Confirmar
15. Marcar como "En Preparación"
16. Marcar como "Lista para Retirar"
17. Completar orden

#### Ver Orden (Buyer)
18. Logout → Login del buyer
19. Click en "Mis Órdenes"
20. Ver orden con estado actualizado

---

## 🎯 Endpoints que usa el Frontend

| Vista | Método | Endpoint | Propósito |
|-------|--------|----------|-----------|
| Login | POST | `/api/auth/login` | Autenticación |
| Registro | POST | `/api/auth/register` | Crear usuario |
| Catálogo | GET | `/api/catalog/products?available=true` | Listar productos disponibles |
| Crear Producto | POST | `/api/catalog/products` | Restaurant crea producto |
| Actualizar Producto | PUT | `/api/catalog/products/:id` | Restaurant edita producto |
| Eliminar Producto | DELETE | `/api/catalog/products/:id` | Restaurant elimina producto |
| Crear Orden | POST | `/api/orders` | Buyer crea orden |
| Mis Órdenes | GET | `/api/orders` | Buyer ve sus órdenes |
| Órdenes Restaurante | GET | `/api/orders` | Restaurant ve sus órdenes (auto-filtrado) |
| Confirmar Orden | POST | `/api/orders/:id/confirm` | Restaurant confirma |
| En Preparación | POST | `/api/orders/:id/preparing` | Restaurant prepara |
| Lista | POST | `/api/orders/:id/ready` | Restaurant lista |
| Completar | POST | `/api/orders/:id/complete` | Restaurant completa |
| Cancelar | POST | `/api/orders/:id/cancel` | Buyer/Restaurant cancela |

---

## ⚠️ Errores Comunes y Soluciones

### Error: "Cannot read property 'data' of undefined"
**Causa**: El backend está devolviendo error antes de los datos

**Solución**: Revisar que el backend esté corriendo y que el token sea válido

### Error: "Stock insuficiente"
**Causa**: El producto no tiene suficiente stock en el backend

**Solución**: Verificar stock en AdminView o aumentar stock del producto

### Error: "Token inválido o expirado"
**Causa**: El token expiró (8 horas) o fue modificado

**Solución**: Hacer logout y login nuevamente

### Error: "No autorizado. Solo puede ver las órdenes de su propio restaurante"
**Causa**: El restaurante está intentando ver órdenes de otro restaurante

**Solución**: El backend filtra automáticamente - esto es correcto

---

## 📋 Checklist de Funcionalidades

- [x] Login/Registro con JWT
- [x] Persistencia de sesión (recargar página mantiene login)
- [x] Catálogo de productos disponibles
- [x] Carrito de compras local
- [x] Validación de mismo restaurante en carrito
- [x] Crear orden con múltiples items
- [x] Manejo de errores de stock
- [x] CRUD de productos (restaurant)
- [x] Gestión de órdenes (restaurant)
- [x] Ver mis órdenes (buyer)
- [x] Cancelar órdenes (buyer/restaurant)
- [x] Logout automático al expirar token

---

**Actualización completada:** 2026-05-13  
**Archivos creados:** 2  
**Archivos actualizados:** 11  
**Estado:** ✅ Listo para probar
