// ViewModel para Órdenes (MVVM Pattern)
import { useState, useCallback } from 'react';
import { useAppContext, ActionTypes } from '../context/AppContext';
import api from '../services/api';

export function useOrdersViewModel() {
  const { dispatch, state } = useAppContext();
  const [localError, setLocalError] = useState(null);

  // Crear orden/reserva
  const createOrder = useCallback(async (orderData) => {
    console.log('🛒 createOrder (ViewModel) - Iniciando...', orderData);
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    setLocalError(null);

    try {
      // Timeout de 30 segundos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: El servidor tardó demasiado en responder. Intentá de nuevo.')), 30000);
      });
      
      // Usar API directa al orders-service (no pasa por el gateway)
      const orderPromise = api.post('/orders', orderData);
      
      // Race entre timeout y request real
      const response = await Promise.race([orderPromise, timeoutPromise]);
      const data = response.data;

      console.log('🛒 createOrder (ViewModel) - Response:', data);

      // Agregar orden al estado global
      dispatch({
        type: ActionTypes.ADD_ORDER,
        payload: data.data || data.order,
      });

      return { success: true, data: data.data || data.order };
    } catch (error) {
      console.error('❌ createOrder (ViewModel) - Error:', error);
      
      // Manejar error de stock (409)
      if (error.response?.status === 409) {
        const message = 'Stock insuficiente para algunos productos. Por favor revisá tu carrito.';
        setLocalError(message);
        dispatch({ type: ActionTypes.SET_ERROR, payload: message });
        return { success: false, error: message, details: error.response?.data?.details };
      }
      
      const message = error.response?.data?.error || error.message || 'Error al crear orden';
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch]);

  // Obtener MIS órdenes (para el usuario autenticado)
  // - Si es restaurant: devuelve órdenes de SU restaurante
  // - Si es buyer: devuelve SUS órdenes como cliente
  const getMyOrders = useCallback(async () => {
    console.log('📋 getMyOrders - Iniciando carga...');
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    setLocalError(null);

    try {
      console.log('📋 getMyOrders - Llamando a API /orders...');
      const response = await api.get('/orders');
      console.log('📋 getMyOrders - Response recibido:', response.data);
      
      // Extraer array de órdenes correctamente
      // La API puede devolver: {data: [...]} o {data: {data: [...]}}
      let ordersArray = [];
      if (Array.isArray(response.data)) {
        ordersArray = response.data;
      } else if (Array.isArray(response.data.data)) {
        ordersArray = response.data.data;
      } else if (Array.isArray(response.data.orders)) {
        ordersArray = response.data.orders;
      } else if (response.data?.data && Array.isArray(response.data.data.data)) {
        ordersArray = response.data.data.data;
      } else {
        console.error('📋 getMyOrders - Formato de response inesperado:', response.data);
        ordersArray = [];
      }
      
      console.log('📋 getMyOrders - Órdenes extraídas:', ordersArray.length);

      dispatch({ type: ActionTypes.SET_ORDERS, payload: ordersArray });
      return { success: true, orders: ordersArray };
    } catch (error) {
      console.error('❌ getMyOrders - Error:', error);
      const message = error.response?.data?.error || error.message || 'Error al cargar órdenes';
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
    } finally {
      console.log('📋 getMyOrders - Finalizado (loading = false)');
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch]);

  // Cancelar orden
  const cancelOrder = useCallback(async (orderId) => {
    if (!window.confirm('¿Seguro que querés cancelar esta orden?')) {
      return { success: false, error: 'Cancelado por el usuario' };
    }

    try {
      const response = await api.post(`/orders/${orderId}/cancel`);
      const data = response.data;

      // Recargar órdenes
      await getMyOrders();

      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Error al cancelar orden';
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  }, [dispatch, getMyOrders]);

  // Confirmar orden (restaurant)
  const confirmOrder = useCallback(async (orderId) => {
    try {
      const response = await api.post(`/orders/${orderId}/confirm`);
      const data = response.data;

      // Actualizar orden en el estado
      dispatch({
        type: ActionTypes.UPDATE_ORDER,
        payload: data.data || data.order,
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Error al confirmar orden';
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  }, [dispatch]);

  // Marcar como en preparación (restaurant)
  const markAsPreparing = useCallback(async (orderId) => {
    try {
      const response = await api.post(`/orders/${orderId}/preparing`);
      const data = response.data;

      dispatch({
        type: ActionTypes.UPDATE_ORDER,
        payload: data.data || data.order,
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Error al actualizar orden';
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  }, [dispatch]);

  // Marcar como lista (restaurant)
  const markAsReady = useCallback(async (orderId) => {
    try {
      const response = await api.post(`/orders/${orderId}/ready`);
      const data = response.data;

      dispatch({
        type: ActionTypes.UPDATE_ORDER,
        payload: data.data || data.order,
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Error al actualizar orden';
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  }, [dispatch]);

  // Completar orden (restaurant)
  const completeOrder = useCallback(async (orderId) => {
    try {
      const response = await api.post(`/orders/${orderId}/complete`);
      const data = response.data;

      dispatch({
        type: ActionTypes.UPDATE_ORDER,
        payload: data.data || data.order,
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Error al completar orden';
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  }, [dispatch]);

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
    confirmOrder,
    markAsPreparing,
    markAsReady,
    completeOrder,
  };
}
