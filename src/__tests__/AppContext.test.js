/**
 * Tests unitarios para AppContext (Observer Pattern).
 * Verifica el reducer y el estado inicial sin necesidad de montar componentes React.
 */

import { initialState, ActionTypes, appReducer } from '../context/AppContext';

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

  it('tiene loading como mapa por dominio (auth/products/orders) en false', () => {
    expect(initialState.loading).toEqual({ auth: false, products: false, orders: false });
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

  it('LOGOUT limpia user, token, orders, products y error (evita datos del usuario anterior)', () => {
    const loggedState = {
      ...initialState,
      user: { id: 1 },
      token: 'jwt',
      orders: [{ _id: 'o1' }],
      products: [{ _id: 'p1' }],
      error: 'algo falló antes',
    };
    const newState = appReducer(loggedState, { type: ActionTypes.LOGOUT });
    expect(newState.user).toBeNull();
    expect(newState.token).toBeNull();
    expect(newState.orders).toEqual([]);
    expect(newState.products).toEqual([]);
    expect(newState.error).toBeNull();
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

  it('SET_LOADING solo modifica el dominio indicado, sin afectar a los demás', () => {
    let state = appReducer(initialState, {
      type: ActionTypes.SET_LOADING,
      payload: { domain: 'products', value: true },
    });
    expect(state.loading).toEqual({ auth: false, products: true, orders: false });

    state = appReducer(state, {
      type: ActionTypes.SET_LOADING,
      payload: { domain: 'orders', value: true },
    });
    expect(state.loading).toEqual({ auth: false, products: true, orders: true });

    // Terminar el loading de "products" no debe pisar el de "orders" (race condition del bug original)
    state = appReducer(state, {
      type: ActionTypes.SET_LOADING,
      payload: { domain: 'products', value: false },
    });
    expect(state.loading).toEqual({ auth: false, products: false, orders: true });
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
