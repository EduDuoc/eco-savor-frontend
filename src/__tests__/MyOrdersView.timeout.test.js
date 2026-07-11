/**
 * Bug: MyOrdersView usaba setTimeout + Promise.race para "cortar" la espera
 * a los 10s, pero eso no cancelaba el request real de axios (getMyOrders
 * seguía en vuelo). Fix esperado: pasar un AbortController real a
 * getMyOrders para cancelar de verdad el request cuando se cumple el timeout.
 */
import React from 'react';
import { render, waitFor, act } from '@testing-library/react';

jest.mock('../viewmodels/useOrdersViewModel', () => ({
  useOrdersViewModel: jest.fn(),
}));

// eslint-disable-next-line import/first
import { useOrdersViewModel } from '../viewmodels/useOrdersViewModel';
// eslint-disable-next-line import/first
import { MyOrdersView } from '../views/MyOrdersView';

describe('MyOrdersView — cancelación real con AbortController al cargar órdenes', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('pasa un AbortSignal a getMyOrders y lo aborta a los 10s', async () => {
    let capturedOptions;
    const getMyOrders = jest.fn((options) => {
      capturedOptions = options;
      return new Promise(() => {}); // simula un request que nunca resuelve por sí solo
    });

    useOrdersViewModel.mockReturnValue({
      orders: [],
      loading: false,
      error: null,
      getMyOrders,
      cancelOrder: jest.fn(),
    });

    render(<MyOrdersView />);

    await waitFor(() => expect(getMyOrders).toHaveBeenCalled());
    expect(capturedOptions?.signal).toBeDefined();
    expect(capturedOptions.signal.aborted).toBe(false);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(capturedOptions.signal.aborted).toBe(true);
  });
});
