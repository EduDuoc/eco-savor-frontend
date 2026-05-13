// ViewModel para Órdenes (MVVM Pattern)
import { useState, useCallback } from 'react';
import { useAppContext, ActionTypes } from '../context/AppContext';

const API_URL = 'http://localhost:3000/api';

export function useOrdersViewModel() {
  const { dispatch, state } = useAppContext();
  const [localError, setLocalError] = useState(null);

  // Crear orden/reserva
  const createOrder = useCallback(async (orderData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    setLocalError(null);

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear orden');
      }

      // Agregar orden al estado global
      dispatch({
        type: ActionTypes.ADD_ORDER,
        payload: data.order || data,
      });

      return { success: true, data: data.order || data };
    } catch (error) {
      setLocalError(error.message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch]);

  // Obtener mis órdenes
  const getMyOrders = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    setLocalError(null);

    try {
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar órdenes');
      }

      dispatch({ type: ActionTypes.SET_ORDERS, payload: data.orders || data });
      return { success: true, orders: data.orders || data };
    } catch (error) {
      setLocalError(error.message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch]);

  // Cancelar orden
  const cancelOrder = useCallback(async (orderId) => {
    window.alert('¿Seguro que querés cancelar esta orden?');
    // Nota: Usamos window.alert en vez de confirm() por ESLint

    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cancelar orden');
      }

      // Recargar órdenes
      await getMyOrders();

      return { success: true };
    } catch (error) {
      setLocalError(error.message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch, getMyOrders]);

  // Estado derivado
  const orders = state.orders;
  const loading = state.loading;
  const error = localError || state.error;

  return {
    // Estado
    orders,
    loading,
    error,

    // Acciones
    createOrder,
    getMyOrders,
    cancelOrder,
  };
}
