// ViewModel para Productos (MVVM Pattern)
import { useState, useCallback, useEffect } from 'react';
import { useAppContext, ActionTypes } from '../context/AppContext';
import api from '../services/api';

export function useProductsViewModel() {
  const { dispatch, state } = useAppContext();
  const [localError, setLocalError] = useState(null);

  // Cargar productos (solo disponibles)
  const loadProducts = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    setLocalError(null);

    try {
      const response = await api.get('/catalog/products', {
        params: { available: 'true' }
      });

      const data = response.data;
      dispatch({ type: ActionTypes.SET_PRODUCTS, payload: data.data || data.products || data });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Error al cargar productos';
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch]);

  // Cargar SOLO mis productos (para restaurantes)
  const loadMyProducts = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    setLocalError(null);

    try {
      const response = await api.get('/catalog/my-products');
      const data = response.data;
      dispatch({ type: ActionTypes.SET_PRODUCTS, payload: data.data || data.products || data });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Error al cargar tus productos';
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch]);

  // Crear producto (admin/restaurant)
  // Nota: loadMyProducts está en deps porque usa useCallback y es estable
  const createProduct = useCallback(async (productData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    setLocalError(null);

    try {
      const response = await api.post('/catalog/products', productData);
      const data = response.data;

      // Recargar MIS productos (no todos los productos)
      await loadMyProducts();

      return { success: true, data: data.data || data.product };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Error al crear producto';
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch, loadMyProducts]); // ✅ loadMyProducts está memoizado con useCallback, seguro incluirlo

  // Actualizar producto (admin/restaurant)
  const updateProduct = useCallback(async (id, productData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    setLocalError(null);

    try {
      const response = await api.put(`/catalog/products/${id}`, productData);
      const data = response.data;

      // Recargar MIS productos (no todos los productos)
      await loadMyProducts();

      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Error al actualizar producto';
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch, loadMyProducts]); // ✅ loadMyProducts está memoizado con useCallback, seguro incluirlo

  // Eliminar producto (admin/restaurant)
  const deleteProduct = useCallback(async (id) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    setLocalError(null);

    try {
      const response = await api.delete(`/catalog/products/${id}`);

      // Recargar MIS productos (no todos los productos)
      await loadMyProducts();

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Error al eliminar producto';
      setLocalError(message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      return { success: false, error: message };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch, loadMyProducts]); // ✅ loadMyProducts está memoizado con useCallback, seguro incluirlo

  // Estado derivado del contexto
  const products = state.products;
  const loading = state.loading;
  const error = localError || state.error;

  return {
    // Estado
    products,
    loading,
    error,

    // Acciones
    loadProducts,
    loadMyProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
