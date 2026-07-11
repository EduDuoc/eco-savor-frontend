/**
 * Tests unitarios para useAuthViewModel — restauración de sesión desde localStorage.
 * Bug: el hook decodificaba el JWT al montar pero nunca validaba `exp`, restaurando
 * sesiones "zombie" con tokens ya vencidos.
 */
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { AppProvider, useAppContext } from '../context/AppContext';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';

function makeToken(payload) {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;

describe('useAuthViewModel — restauración de sesión desde localStorage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('NO restaura la sesión si el token está vencido (exp en el pasado)', async () => {
    const expiredToken = makeToken({
      sub: '1',
      email: 'user@test.com',
      role: 'buyer',
      exp: Math.floor(Date.now() / 1000) - 60, // vencido hace 60s
    });
    localStorage.setItem('token', expiredToken);

    const { result } = renderHook(
      () => ({ auth: useAuthViewModel(), ctx: useAppContext() }),
      { wrapper }
    );

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
    });

    expect(result.current.auth.isAuthenticated).toBe(false);
    expect(result.current.auth.user).toBeNull();
  });

  it('SI restaura la sesión si el token es válido (exp en el futuro)', async () => {
    const validToken = makeToken({
      sub: '1',
      email: 'user@test.com',
      role: 'buyer',
      exp: Math.floor(Date.now() / 1000) + 3600, // vence en 1h
    });
    localStorage.setItem('token', validToken);

    const { result } = renderHook(() => useAuthViewModel(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.user.email).toBe('user@test.com');
    expect(localStorage.getItem('token')).toBe(validToken);
  });
});
