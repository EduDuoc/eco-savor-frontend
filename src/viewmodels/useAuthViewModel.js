// ViewModel para Autenticación (MVVM Pattern)
import { useState, useCallback, useEffect } from 'react';
import { useAppContext, ActionTypes } from '../context/AppContext';
import api from '../services/api';

export function useAuthViewModel() {
  const { dispatch, state } = useAppContext();
  const [localError, setLocalError] = useState(null);

  // Cargar usuario desde token al iniciar (persistencia)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decodificar JWT para obtener usuario
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        
      const userData = { 
        id: payload.sub, 
        email: payload.email, 
        role: payload.role,
        name: payload.name || payload.email?.split('@')[0] // Fallback: usar parte del email si no hay nombre
      };
        
        console.log('🔐 Auth - Usuario decodificado del JWT:', userData);
        
        dispatch({
          type: ActionTypes.SET_USER,
          payload: { 
            user: userData, 
            token 
          },
        });
      } catch (e) {
        console.error('Token inválido:', e);
        localStorage.removeItem('token');
      }
    }
  }, [dispatch]);

  // Login
  const login = useCallback(async (email, password) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    setLocalError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      console.log('🔐 Auth - Response del login:', data);

      // Guardar token y usuario en el estado global
      dispatch({
        type: ActionTypes.SET_USER,
        payload: { user: data.user, token: data.token },
      });

      // Guardar token y usuario en localStorage para persistencia
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('🔐 Auth - Usuario guardado en localStorage:', data.user);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Error al iniciar sesión';
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch]);

  // Registro
  const register = useCallback(async (userData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    setLocalError(null);

    try {
      const response = await api.post('/auth/register', userData);
      const data = response.data;

      return { success: true, data: data.data };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Error al registrar';
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
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
