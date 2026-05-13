// Estado Global de la Aplicación (Observer Pattern)
import { createContext, useReducer, useContext } from 'react';

// Estado inicial
const initialState = {
  user: null,           // Usuario logueado
  token: null,          // JWT token
  products: [],         // Lista de productos
  orders: [],           // Órdenes del usuario
  loading: false,       // Estado de carga
  error: null,          // Error actual
};

// Tipos de acciones
const ActionTypes = {
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_ORDERS: 'SET_ORDERS',
  ADD_ORDER: 'ADD_ORDER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return { ...state, user: action.payload.user, token: action.payload.token };
    case ActionTypes.LOGOUT:
      return { ...state, user: null, token: null };
    case ActionTypes.SET_PRODUCTS:
      return { ...state, products: action.payload };
    case ActionTypes.SET_ORDERS:
      return { ...state, orders: action.payload };
    case ActionTypes.ADD_ORDER:
      return { ...state, orders: [...state.orders, action.payload] };
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
}

// Contexto
const AppContext = createContext(null);

// Provider (Observable)
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = { state, dispatch, ActionTypes };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook para usar el contexto (Observer)
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de un AppProvider');
  }
  return context;
}

export { AppContext, initialState, ActionTypes };
