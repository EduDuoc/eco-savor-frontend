// ViewModel para Autenticación (MVVM Pattern)
import { useState, useCallback } from 'react';
import { useAppContext, ActionTypes } from '../context/AppContext';

const API_URL = 'http://localhost:3000/api';

export function useAuthViewModel() {
  const { dispatch, state } = useAppContext();
  const [localError, setLocalError] = useState(null);

  // Login
  const login = useCallback(async (email, password) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    setLocalError(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Guardar token y usuario en el estado global
      dispatch({
        type: ActionTypes.SET_USER,
        payload: { user: data.user, token: data.token },
      });

      // Guardar token en localStorage para persistencia
      localStorage.setItem('token', data.token);

      return { success: true };
    } catch (error) {
      setLocalError(error.message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch]);

  // Registro
  const register = useCallback(async (userData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    setLocalError(null);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar');
      }

      return { success: true, data: data.data };
    } catch (error) {
      setLocalError(error.message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    dispatch({ type: ActionTypes.LOGOUT });
  }, [dispatch]);

  // Verificar si está logueado
  const isAuthenticated = !!state.token;
  const user = state.user;

  return {
    // Estado
    loading: state.loading,
    error: localError || state.error,
    user,
    isAuthenticated,

    // Acciones
    login,
    register,
    logout,
  };
}
