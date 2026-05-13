// MyOrdersView - View Layer (MVVM Pattern)
import React, { useEffect, useState } from 'react';
import { useOrdersViewModel } from '../viewmodels/useOrdersViewModel';

export function MyOrdersView() {
  const { orders, getMyOrders, cancelOrder, loading, error } = useOrdersViewModel();
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      setLocalLoading(true);
      try {
        // Timeout de 10 segundos para evitar loading infinito
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout al cargar órdenes')), 10000);
        });
        
        const ordersPromise = getMyOrders();
        
        // Race entre el timeout y la carga real
        await Promise.race([ordersPromise, timeoutPromise]);
      } catch (err) {
        console.error('Error cargando órdenes:', err);
      } finally {
        setLocalLoading(false);
      }
    };
    
    loadOrders();
  }, [getMyOrders]);

  const handleCancel = async (orderId) => {
    if (window.confirm('¿Seguro que querés cancelar esta orden?')) {
      const result = await cancelOrder(orderId);
      if (result.success) {
        alert('Orden cancelada');
      } else {
        alert('Error al cancelar: ' + result.error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      preparing: '#8b5cf6',
      ready: '#10b981',
      completed: '#059669',
      cancelled: '#ef4444',
    };
    return (
      <span style={{ background: colors[status], color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
        {status}
      </span>
    );
  };

  return (
    <div className="orders-container">
      <h1>Mis Órdenes</h1>

      {(loading || localLoading) && <div className="loading">Cargando órdenes...</div>}
      {error && <div className="error-message">⚠️ {error}</div>}

      <div className="orders-list">
        {orders && Array.isArray(orders) && orders.map((order) => (
          <div key={order._id || order.id} className="order-card">
            <div className="order-header">
              <h3>Orden #{order._id?.slice(-6) || order.id?.slice(-6)}</h3>
              {getStatusBadge(order.status)}
            </div>
            <div className="order-body">
              {/* Lista de items */}
              <div className="order-items">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div key={item.productId || idx} className="order-item">
                      <p><strong>Producto:</strong> {item.name}</p>
                      <p><strong>Cantidad:</strong> {item.quantity}</p>
                      <p><strong>Precio:</strong> ${item.price}</p>
                    </div>
                  ))
                ) : (
                  <p>Sin productos</p>
                )}
              </div>
              <p><strong>Total:</strong> ${order.totalAmount}</p>
              <p><strong>Fecha:</strong> {new Date(order.reservedAt || order.createdAt).toLocaleDateString()}</p>
            </div>
            {order.status === 'pending' && (
              <button onClick={() => handleCancel(order._id || order.id)} className="btn-danger">
                Cancelar Orden
              </button>
            )}
          </div>
        ))}
      </div>

      {(!orders || (Array.isArray(orders) && orders.length === 0)) && !loading && (
        <p className="no-orders">No tenés órdenes activas</p>
      )}
    </div>
  );
}
