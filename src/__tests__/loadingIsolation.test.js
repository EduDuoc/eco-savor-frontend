/**
 * Test de integración: el `loading` de useProductsViewModel y useOrdersViewModel
 * deben ser independientes. Bug original: `loading` era un único booleano
 * compartido en AppContext, así que terminar una carga de productos apagaba
 * (o encendía) el loading de órdenes por accidente (race condition de UI).
 */
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { useProductsViewModel } from '../viewmodels/useProductsViewModel';
import { useOrdersViewModel } from '../viewmodels/useOrdersViewModel';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// eslint-disable-next-line import/first
import api from '../services/api';

const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;

describe('loading por dominio — sin contaminación cruzada', () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
  });

  it('loadProducts en curso no marca loading=true para orders', async () => {
    let resolveProducts;
    const productsPromise = new Promise((resolve) => {
      resolveProducts = resolve;
    });
    api.get.mockReturnValueOnce(productsPromise);

    const { result } = renderHook(
      () => ({
        products: useProductsViewModel(),
        orders: useOrdersViewModel(),
      }),
      { wrapper }
    );

    act(() => {
      result.current.products.loadProducts();
    });

    await waitFor(() => {
      expect(result.current.products.loading).toBe(true);
    });

    // El bug original compartía un solo booleano: esto fallaba porque
    // orders.loading también quedaba en true.
    expect(result.current.orders.loading).toBe(false);

    await act(async () => {
      resolveProducts({ data: { data: [] } });
      await productsPromise;
    });

    await waitFor(() => {
      expect(result.current.products.loading).toBe(false);
    });
    expect(result.current.orders.loading).toBe(false);
  });

  it('terminar getMyOrders no apaga el loading de products que sigue en curso', async () => {
    let resolveProducts;
    const productsPromise = new Promise((resolve) => {
      resolveProducts = resolve;
    });
    api.get.mockImplementation((endpoint) => {
      if (endpoint === '/orders') {
        return Promise.resolve({ data: { data: [] } });
      }
      return productsPromise;
    });

    const { result } = renderHook(
      () => ({
        products: useProductsViewModel(),
        orders: useOrdersViewModel(),
      }),
      { wrapper }
    );

    act(() => {
      result.current.products.loadProducts();
    });

    await waitFor(() => {
      expect(result.current.products.loading).toBe(true);
    });

    await act(async () => {
      await result.current.orders.getMyOrders();
    });

    // El fetch de orders ya terminó (loading orders = false) pero products
    // sigue pendiente: con un booleano global, esto lo hubiera apagado también.
    expect(result.current.products.loading).toBe(true);
    expect(result.current.orders.loading).toBe(false);

    await act(async () => {
      resolveProducts({ data: { data: [] } });
      await productsPromise;
    });
  });
});
