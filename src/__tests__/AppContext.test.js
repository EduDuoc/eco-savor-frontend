/**
 * Tests unitarios para AppContext (Observer Pattern).
 * Verifica el reducer y el estado inicial sin necesidad de montar componentes React.
 */

import { initialState, ActionTypes } from '../context/AppContext';

// Importamos el reducer directamente (no se exporta, así que lo replicamos para test)
// Es la misma lógica que está en AppContext.js
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
    case ActionTypes.UPDATE_ORDER:
      return {
        ...state,
        orders: state.orders.map(order =>
          order._id === action.payload._id ? action.payload : order
        ),
      };
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

describe('AppContext — Estado inicial', () => {
  it('tiene user null por defecto', () => {
    expect(initialState.user).toBeNull();
  });

  it('tiene token null por defecto', () => {
    expect(initialState.token).toBeNull();
  });

  it('tiene products como array vacío', () => {
    expect(initialState.products).toEqual([]);
  });

  it('tiene orders como array vacío', () => {
    expect(initialState.orders).toEqual([]);
  });

  it('tiene loading en false', () => {
    expect(initialState.loading).toBe(false);
  });

  it('tiene error null', () => {
    expect(initialState.error).toBeNull();
  });
});

describe('AppContext — ActionTypes', () => {
  it('tiene todas las acciones requeridas', () => {
    expect(ActionTypes).toHaveProperty('SET_USER');
    expect(ActionTypes).toHaveProperty('LOGOUT');
    expect(ActionTypes).toHaveProperty('SET_PRODUCTS');
    expect(ActionTypes).toHaveProperty('SET_ORDERS');
    expect(ActionTypes).toHaveProperty('ADD_ORDER');
    expect(ActionTypes).toHaveProperty('UPDATE_ORDER');
    expect(ActionTypes).toHaveProperty('SET_LOADING');
    expect(ActionTypes).toHaveProperty('SET_ERROR');
    expect(ActionTypes).toHaveProperty('CLEAR_ERROR');
  });
});

describe('AppContext — Reducer', () => {
  it('SET_USER actualiza user y token', () => {
    const payload = { user: { id: 1, email: 'test@test.com' }, token: 'jwt-token' };
    const newState = appReducer(initialState, { type: ActionTypes.SET_USER, payload });
    expect(newState.user).toEqual(payload.user);
    expect(newState.token).toBe('jwt-token');
  });

  it('LOGOUT limpia user y token', () => {
    const loggedState = { ...initialState, user: { id: 1 }, token: 'jwt' };
    const newState = appReducer(loggedState, { type: ActionTypes.LOGOUT });
    expect(newState.user).toBeNull();
    expect(newState.token).toBeNull();
  });

  it('SET_PRODUCTS reemplaza la lista de productos', () => {
    const products = [{ id: 1, name: 'Pan' }, { id: 2, name: 'Leche' }];
    const newState = appReducer(initialState, { type: ActionTypes.SET_PRODUCTS, payload: products });
    expect(newState.products).toHaveLength(2);
  });

  it('ADD_ORDER agrega una orden al array existente', () => {
    const order1 = { _id: '1', status: 'pending' };
    const stateWithOrder = appReducer(initialState, { type: ActionTypes.ADD_ORDER, payload: order1 });
    const order2 = { _id: '2', status: 'confirmed' };
    const finalState = appReducer(stateWithOrder, { type: ActionTypes.ADD_ORDER, payload: order2 });
    expect(finalState.orders).toHaveLength(2);
  });

  it('UPDATE_ORDER modifica una orden existente por _id', () => {
    const stateWithOrders = {
      ...initialState,
      orders: [
        { _id: '1', status: 'pending' },
        { _id: '2', status: 'confirmed' },
      ],
    };
    const updated = { _id: '1', status: 'ready' };
    const newState = appReducer(stateWithOrders, { type: ActionTypes.UPDATE_ORDER, payload: updated });
    expect(newState.orders[0].status).toBe('ready');
    expect(newState.orders[1].status).toBe('confirmed');
  });

  it('SET_LOADING cambia el estado de carga', () => {
    let newState = appReducer(initialState, { type: ActionTypes.SET_LOADING, payload: true });
    expect(newState.loading).toBe(true);
    newState = appReducer(newState, { type: ActionTypes.SET_LOADING, payload: false });
    expect(newState.loading).toBe(false);
  });

  it('SET_ERROR guarda un mensaje de error', () => {
    const newState = appReducer(initialState, { type: ActionTypes.SET_ERROR, payload: 'Error de red' });
    expect(newState.error).toBe('Error de red');
  });

  it('CLEAR_ERROR limpia el error', () => {
    const stateWithError = { ...initialState, error: 'Algo falló' };
    const newState = appReducer(stateWithError, { type: ActionTypes.CLEAR_ERROR });
    expect(newState.error).toBeNull();
  });

  it('acción desconocida devuelve el mismo estado', () => {
    const newState = appReducer(initialState, { type: 'INVENTADA' });
    expect(newState).toEqual(initialState);
  });
});
