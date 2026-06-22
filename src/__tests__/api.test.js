/**
 * Tests unitarios para el servicio de API (axios).
 * Verifica que la instancia de axios tenga la configuración correcta.
 */

describe('API Service', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
    process.env = { ...OLD_ENV };
    delete process.env.REACT_APP_API_BASE_URL;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('usa localhost:3000/api como baseURL por defecto', () => {
    const api = require('../services/api').default;
    expect(api.defaults.baseURL).toBe('http://localhost:3000/api');
  });

  it('usa REACT_APP_API_BASE_URL cuando está definida', () => {
    process.env.REACT_APP_API_BASE_URL = 'https://api.ecosavor.com/api';
    const api = require('../services/api').default;
    expect(api.defaults.baseURL).toBe('https://api.ecosavor.com/api');
  });

  it('tiene Content-Type application/json por defecto', () => {
    const api = require('../services/api').default;
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('agrega token de localStorage en el interceptor de request', async () => {
    localStorage.setItem('token', 'test-jwt-token');
    const api = require('../services/api').default;

    // Ejecutar el interceptor de request manualmente
    const config = { headers: {} };
    const interceptor = api.interceptors.request.handlers[0];
    const result = await interceptor.fulfilled(config);

    expect(result.headers.Authorization).toBe('Bearer test-jwt-token');
  });

  it('no agrega Authorization si no hay token en localStorage', async () => {
    const api = require('../services/api').default;
    const config = { headers: {} };
    const interceptor = api.interceptors.request.handlers[0];
    const result = await interceptor.fulfilled(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it('limpia localStorage en respuesta 401', async () => {
    localStorage.setItem('token', 'expired-token');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));

    const api = require('../services/api').default;
    const error = {
      response: { status: 401, data: { error: 'Token expirado' } },
    };

    try {
      const responseInterceptor = api.interceptors.response.handlers[0];
      await responseInterceptor.rejected(error);
    } catch (e) {
      // Esperado
    }

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('no modifica localStorage en errores que no son 401', async () => {
    localStorage.setItem('token', 'valid-token');

    const api = require('../services/api').default;
    const error = {
      response: { status: 500, data: { error: 'Error interno' } },
    };

    try {
      const responseInterceptor = api.interceptors.response.handlers[0];
      await responseInterceptor.rejected(error);
    } catch (e) {
      // Esperado
    }

    expect(localStorage.getItem('token')).toBe('valid-token');
  });
});
