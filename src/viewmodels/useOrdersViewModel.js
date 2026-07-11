// ViewModel para Órdenes (MVVM Pattern)
import { useState, useCallback } from 'react';
import { useAppContext, ActionTypes } from '../context/AppContext';
import api from '../services/api';
import { getErrorMessage } from '../utils/errors';

export function useOrdersViewModel() {
  const { dispatch, state } = useAppContext();
  const [localError, setLocalError] = useState(null);

  // Crear orden/reserva
  const createOrder = useCallback(async (orderData) => {
    console.log('🛒 createOrder (ViewModel) - Iniciando...', orderData);
    dispatch({ type: ActionTypes.SET_LOADING, payload: { domain: 'orders', value: true } });
    setLocalError(null);

    // Timeout de 30 segundos con AbortController: cancela de verdad el
    // request de axios en vez de sólo "abandonarlo" con un Promise.race.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      // Usar API directa al orders-service (no pasa por el gateway)
      const response = await api.post('/orders', orderData, { signal: controller.signal });
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

      // Request cancelado por el timeout (AbortController)
      if (error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
        const message = 'Timeout: El servidor tardó demasiado en responder. Intentá de nuevo.';
        setLocalError(message);
        dispatch({ type: ActionTypes.SET_ERROR, payload: message });
        return { success: false, error: message };
      }

      // Manejar error de stock (409)
      if (error.response?.status === 409) {
        const message = 'Stock insuficiente para algunos productos. Por favor revisá tu carrito.';
        setLocalError(message);
        dispatch({ type: ActionTypes.SET_ERROR, payload: message });
        return { success: false, error: message, details: error.response?.data?.details };
      }

      const message = getErrorMessage(error, 'Error al crear orden');
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
    } finally {
      clearTimeout(timeoutId);
      dispatch({ type: ActionTypes.SET_LOADING, payload: { domain: 'orders', value: false } });
    }
  }, [dispatch]);

  // Obtener MIS órdenes (para el usuario autenticado)
  // - Si es restaurant: devuelve órdenes de SU restaurante
  // - Si es buyer: devuelve SUS órdenes como cliente
  const getMyOrders = useCallback(async ({ signal } = {}) => {
    console.log('📋 getMyOrders - Iniciando carga...');
    dispatch({ type: ActionTypes.SET_LOADING, payload: { domain: 'orders', value: true } });
    setLocalError(null);

    try {
      console.log('📋 getMyOrders - Llamando a API /orders...');
      const response = await api.get('/orders', signal ? { signal } : undefined);
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

      if (error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
        const message = 'Timeout: El servidor tardó demasiado en responder. Intentá de nuevo.';
        setLocalError(message);
        dispatch({ type: ActionTypes.SET_ERROR, payload: message });
        return { success: false, error: message };
      }

      const message = getErrorMessage(error, 'Error al cargar órdenes');
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
    } finally {
      console.log('📋 getMyOrders - Finalizado (loading = false)');
      dispatch({ type: ActionTypes.SET_LOADING, payload: { domain: 'orders', value: false } });
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
      const message = getErrorMessage(error, 'Error al cancelar orden');
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  }, [dispatch, getMyOrders]);

  // Helper interno: acciones de cambio de estado de orden (restaurant) que
  // sólo difieren en el endpoint y en el mensaje de error por defecto.
  const updateOrderStatus = useCallback(async (orderId, action, errorMessage) => {
    try {
      const response = await api.post(`/orders/${orderId}/${action}`);
      const data = response.data;

      dispatch({
        type: ActionTypes.UPDATE_ORDER,
        payload: data.data || data.order,
      });

      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, errorMessage);
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  }, [dispatch]);

  // Confirmar orden (restaurant)
  const confirmOrder = useCallback((orderId) => (
    updateOrderStatus(orderId, 'confirm', 'Error al confirmar orden')
  ), [updateOrderStatus]);

  // Marcar como en preparación (restaurant)
  const markAsPreparing = useCallback((orderId) => (
    updateOrderStatus(orderId, 'preparing', 'Error al actualizar orden')
  ), [updateOrderStatus]);

  // Marcar como lista (restaurant)
  const markAsReady = useCallback((orderId) => (
    updateOrderStatus(orderId, 'ready', 'Error al actualizar orden')
  ), [updateOrderStatus]);

  // Completar orden (restaurant)
  const completeOrder = useCallback((orderId) => (
    updateOrderStatus(orderId, 'complete', 'Error al completar orden')
  ), [updateOrderStatus]);

  // Estado derivado
  const orders = state.orders;
  const loading = state.loading.orders;
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
