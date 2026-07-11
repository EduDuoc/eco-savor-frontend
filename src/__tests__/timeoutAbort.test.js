/**
 * Bug: los timeouts manuales (setTimeout + Promise.race) NO cancelaban el
 * request real de axios. El request seguía viajando en segundo plano aunque
 * la UI ya hubiera "avanzado" por el timeout.
 *
 * Fix esperado: usar AbortController real, pasando `signal` en la config de
 * axios, para cancelar de verdad el request cuando se cumple el timeout, y
 * que el finally que apaga el loading corra igual.
 */
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
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

describe('useOrdersViewModel.createOrder — cancelación real con AbortController', () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('pasa un AbortSignal a axios y lo aborta al cumplirse el timeout de 30s', async () => {
    let capturedConfig;
    api.post.mockImplementation((url, data, config) => {
      capturedConfig = config;
      return new Promise((resolve, reject) => {
        config?.signal?.addEventListener('abort', () => {
          const err = new Error('canceled');
          err.code = 'ERR_CANCELED';
          err.name = 'CanceledError';
          reject(err);
        });
      });
    });

    const { result } = renderHook(() => useOrdersViewModel(), { wrapper });

    let promise;
    act(() => {
      promise = result.current.createOrder({ items: [] });
    });

    await waitFor(() => expect(capturedConfig?.signal).toBeDefined());
    expect(capturedConfig.signal.aborted).toBe(false);
    expect(result.current.loading).toBe(true);

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    let outcome;
    await act(async () => {
      outcome = await promise;
    });

    // El request real debe quedar efectivamente cancelado...
    expect(capturedConfig.signal.aborted).toBe(true);
    // ...y el loading debe apagarse igual gracias al finally
    expect(result.current.loading).toBe(false);
    expect(outcome.success).toBe(false);
  });
});
