# EcoSavor Frontend — React con Patrones de Diseño

## Patrones de Diseño Implementados (3/3)

### 1. Module Pattern 📦

**Ubicación:** `src/modules/index.js`

**Descripción:** Organiza el código en módulos exportables que encapsulan funcionalidad relacionada.

```javascript
// modules/index.js
export { AppProvider, useAppContext } from '../context/AppContext';
export { useAuthViewModel } from '../viewmodels/useAuthViewModel';
export { LoginView, CatalogView, AdminView } from '../views/';
export { DiscountedProductCard } from '../components/';
```

**Beneficios:**
- Encapsulamiento de funcionalidad
- Reutilización de componentes
- Imports claros y explícitos
- Separación de responsabilidades

---

### 2. MVVM con React (Model-View-ViewModel) 🎯

**Ubicación:**
- **ViewModel:** `src/viewmodels/*.js` (custom hooks)
- **View:** `src/views/*.jsx` (componentes React)
- **Model:** Backend microservicios

**Estructura:**

```
viewmodels/
├── useAuthViewModel.js    # Lógica de autenticación
├── useProductsViewModel.js # Lógica de productos
└── useOrdersViewModel.js   # Lógica de órdenes

views/
├── LoginView.jsx          # Vista de login
├── CatalogView.jsx        # Vista de catálogo
├── AdminView.jsx          # Vista de administración
└── MyOrdersView.jsx       # Vista de órdenes
```

**Ejemplo ViewModel:**
```javascript
// useAuthViewModel.js
export function useAuthViewModel() {
  const { dispatch } = useAppContext();
  
  const login = async (email, password) => {
    // Lógica de negocio
    const response = await fetch('/api/auth/login', {...});
    dispatch({ type: 'SET_USER', payload: {...} });
  };
  
  return { login, loading, error, user };
}
```

**Ejemplo View:**
```javascript
// LoginView.jsx
export function LoginView({ onNavigate }) {
  const { login, loading, error } = useAuthViewModel();
  
  return (
    <form onSubmit={handleSubmit}>
      {/* UI sin lógica de negocio */}
    </form>
  );
}
```

**Beneficios:**
- Separación clara entre UI y lógica
- Views testeables independientemente
- ViewModels reutilizables
- Mantenibilidad mejorada

---

### 3. Observer Pattern (Context API) 👁️

**Ubicación:** `src/context/AppContext.js`

**Descripción:** Implementa un sistema de publicación-suscripción para el estado global de la aplicación.

**Componentes:**
- **Observable:** `AppContext` (proveedor de estado)
- **Observers:** Componentes que usan `useAppContext()`

```javascript
// AppContext.js
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppProvider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  // Los componentes se "suscriben" al contexto
  return context;
}
```

**Flujo:**
1. Componente dispatcha una acción → `dispatch({ type: 'SET_USER', payload: {...} })`
2. Reducer actualiza el estado
3. Todos los componentes suscriptos se notifica y re-renderizan

**Beneficios:**
- Estado global accesible desde cualquier componente
- Actualizaciones reactivas automáticas
- Sin prop drilling
- Desacoplamiento de componentes

---

## Vistas de la Aplicación

### Para Usuarios (Buyers)
- **LoginView** — Inicio de sesión
- **RegisterView** — Registro de usuarios
- **CatalogView** — Ver productos y reservar
- **MyOrdersView** — Ver mis órdenes

### Para Restaurantes (Admin)
- **AdminView** — Gestionar productos (CRUD completo)

---

## Componentes Reutilizables

### DiscountedProductCard
Componente reciclado del package `@ecosaver/ui` del compañero.

**Props:**
- `name` — Nombre del producto
- `originalPrice` — Precio original
- `discountedPrice` — Precio con descuento
- `stock` — Cantidad disponible
- `expiresAt` — Fecha de vencimiento
- `onReserve` — Callback al reservar

---

## Quick Start

```bash
cd ecosavor-frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Construir para producción
npm run build

# Ejecutar tests
npm test
```

---

## Responsive Design

La aplicación es **100% responsive** y se adapta a móviles, tablets y desktop.

**Breakpoints:**
- `≤768px` — Tablet y móviles (navbar en columna, grid más chico)
- `≤480px` — Móviles chicos (1 columna, botones más pequeños)

**Componentes adaptativos:**
- Navbar (se apila verticalmente en móvil)
- Grid de productos (ajusta columnas automáticamente)
- Carrito (items en columna en móvil)
- Formularios (2 columnas → 1 columna)

---

## Testing

```bash
npm test
```

**Tests incluidos:**
- `App.test.js` — Renderizado de la aplicación y navbar

**Cobertura:**
- Componente App (renderizado inicial)
- Navbar (logo de EcoSavor)
- Catálogo (vista por defecto)

---

## Conexión con el Backend

El frontend se conecta al API Gateway en `http://localhost:3000/api`

**Endpoints usados:**
- `POST /api/auth/login` — Login
- `POST /api/auth/register` — Registro
- `GET /api/catalog/products` — Listar productos
- `POST /api/catalog/products` — Crear producto (admin)
- `POST /api/orders` — Crear orden
- `GET /api/orders/my-orders` — Mis órdenes

---

## Estructura de Carpetas

```
ecosavor-frontend/
├── src/
│   ├── components/          # Componentes compartidos
│   │   └── DiscountedProductCard.jsx
│   ├── context/             # Observer Pattern
│   │   └── AppContext.js
│   ├── modules/             # Module Pattern
│   │   └── index.js
│   ├── viewmodels/          # MVVM (ViewModel layer)
│   │   ├── useAuthViewModel.js
│   │   ├── useProductsViewModel.js
│   │   └── useOrdersViewModel.js
│   ├── views/               # MVVM (View layer)
│   │   ├── LoginView.jsx
│   │   ├── RegisterView.jsx
│   │   ├── CatalogView.jsx
│   │   ├── AdminView.jsx
│   │   ├── MyOrdersView.jsx
│   │   └── Navbar.jsx
│   ├── App.js               # Punto de entrada
│   └── App.css              # Estilos globales
├── package.json
└── README.md
```

---

## Patrones por Archivo

| Archivo | Patrón | Rol |
|---------|--------|-----|
| `modules/index.js` | Module | Exporta módulos |
| `context/AppContext.js` | Observer | Estado global |
| `viewmodels/*.js` | MVVM | ViewModel |
| `views/*.jsx` | MVVM | View |
| `components/*.jsx` | Module | Componente reusable |

---

## Justificación de Patrones

### ¿Por qué Module Pattern?
Para organizar el código en módulos cohesivos que puedan ser importados selectivamente, mejorando la mantenibilidad y el tree-shaking.

### ¿Por qué MVVM?
Para separar claramente la lógica de negocio (ViewModel) de la UI (View), permitiendo tests independientes y mejor colaboración en equipo.

### ¿Por qué Observer Pattern?
Para manejar el estado global de forma reactiva, evitando prop drilling y permitiendo que cualquier componente se suscriba a cambios de estado.
