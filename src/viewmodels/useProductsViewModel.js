// ViewModel para Productos (MVVM Pattern)
import { useState, useCallback, useEffect } from 'react';
import { useAppContext, ActionTypes } from '../context/AppContext';

const API_URL = 'http://localhost:3000/api';

export function useProductsViewModel() {
  const { dispatch, state } = useAppContext();
  const [localError, setLocalError] = useState(null);

  // Cargar productos
  const loadProducts = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    setLocalError(null);

    try {
      const response = await fetch(`${API_URL}/catalog/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar productos');
      }

      dispatch({ type: ActionTypes.SET_PRODUCTS, payload: data.products || data });
      return { success: true };
    } catch (error) {
      setLocalError(error.message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch]);

  // Crear producto (admin)
  const createProduct = useCallback(async (productData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    setLocalError(null);

    try {
      const response = await fetch(`${API_URL}/catalog/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear producto');
      }

      // Recargar lista de productos
      await loadProducts();

      return { success: true, data: data.product || data };
    } catch (error) {
      setLocalError(error.message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch, loadProducts]);

  // Actualizar producto (admin)
  const updateProduct = useCallback(async (id, productData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    setLocalError(null);

    try {
      const response = await fetch(`${API_URL}/catalog/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar producto');
      }

      // Recargar lista de productos
      await loadProducts();

      return { success: true, data };
    } catch (error) {
      setLocalError(error.message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch, loadProducts]);

  // Eliminar producto (admin)
  const deleteProduct = useCallback(async (id) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    setLocalError(null);

    try {
      const response = await fetch(`${API_URL}/catalog/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar producto');
      }

      // Recargar lista de productos
      await loadProducts();

      return { success: true };
    } catch (error) {
      setLocalError(error.message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch, loadProducts]);

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
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
