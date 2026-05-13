# AGENTS.md — EcoSavor Frontend

## Project Overview

React 19 SPA built with Create React App. Connects to API Gateway at `http://localhost:3000/api`.

## Architecture Patterns

**Three core patterns define this codebase:**

1. **Module Pattern** — `src/modules/index.js` is the single export hub. Import from here, not from leaf files.
2. **MVVM** — Clear separation: `src/viewmodels/*.js` (logic) + `src/views/*.jsx` (UI). Views should NOT contain business logic.
3. **Observer Pattern** — `src/context/AppContext.js` manages global state via `useReducer`. All components subscribe via `useAppContext()`.

## Source of Truth

- **Entry point:** `src/index.js` → `src/App.js`
- **Module exports:** `src/modules/index.js` — single source for all public exports
- **Global state:** `src/context/AppContext.js` — defines `state`, `dispatch`, `ActionTypes`
- **API layer:** `src/services/api.js` — axios instance with JWT interceptors (handles 401/403)

## Developer Commands

```bash
npm install        # Install dependencies
npm start          # Dev server (CRA default)
npm run build      # Production build
npm test           # Jest + React Testing Library (watch mode)
```

No lint/typecheck scripts configured — CRA defaults apply.

## Testing

- Test runner: `react-scripts test` (Jest)
- Setup: `src/setupTests.js` imports `@testing-library/jest-dom`
- Single test file exists: `src/App.test.js` (default CRA template — likely stale)
- **No custom test utilities or fixtures** — tests import directly from `src/modules`

## API Integration

Base URL hardcoded in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

**JWT handling:**
- Token stored in `localStorage.getItem('token')`
- Auto-attached to requests via axios interceptor
- 401 responses clear token + user, redirect to `/login`

**Key endpoints:**
- `POST /api/auth/login`, `POST /api/auth/register`
- `GET/POST /api/catalog/products`
- `POST /api/orders`, `GET /api/orders/my-orders`
- `GET/PUT /api/restaurant/orders` (restaurant role)

## State Management

**AppContext actions** (`src/context/AppContext.js`):
- `SET_USER`, `LOGOUT` — authentication
- `SET_PRODUCTS`, `SET_ORDERS`, `ADD_ORDER`, `UPDATE_ORDER` — data
- `SET_LOADING`, `SET_ERROR`, `CLEAR_ERROR` — UI state

**User roles:**
- `user.role === 'restaurant'` → access to `RestaurantOrdersView`
- Default → buyer access to `CatalogView`, `MyOrdersView`

## View Routing

Client-side routing via `currentView` state in `App.js`:
- `'catalog'` (default), `'login'`, `'register'`, `'orders'`, `'cart'`
- `'admin'` — legacy admin view
- `'restaurant-orders'` — restaurant-specific orders view

Navigation passes `setCurrentView` callback to views.

## Component Boundaries

```
src/
├── modules/           # Module Pattern — single export hub
├── viewmodels/        # MVVM — business logic (custom hooks)
├── views/             # MVVM — UI components only
├── components/        # Reusable presentational components
├── context/           # Observer Pattern — global state
├── services/          # API layer (axios)
└── App.js            # Root component + view router
```

**Import rule:** Always import from `src/modules/index.js`, never directly from `src/views/*` or `src/viewmodels/*`.

## Known Quirks

- **No environment variable support** — API URL is hardcoded. Changing it requires editing `src/services/api.js`.
- **No React Router** — navigation is state-based (`currentView`), not URL-based.
- **Test file is stale** — `App.test.js` looks for "learn react" text which doesn't exist.
- **No TypeScript** — plain JavaScript.
- **No CI/CD config** in repo — deployment process is external.

## Conventions

- **ViewModels:** Named `use*ViewModel.js`, export single hook
- **Views:** Named `*View.jsx`, receive `onNavigate` callback for navigation
- **Components:** Presentational only, no business logic
- **Actions:** Defined as constants in `ActionTypes` object
