// MyOrdersView - View Layer (MVVM Pattern)
import React, { useEffect } from 'react';
import { useOrdersViewModel } from '../viewmodels/useOrdersViewModel';

export function MyOrdersView() {
  const { orders, getMyOrders, cancelOrder, loading, error } = useOrdersViewModel();

  useEffect(() => {
    getMyOrders();
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

      {loading && <div className="loading">Cargando órdenes...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id || order.id} className="order-card">
            <div className="order-header">
              <h3>Orden #{order._id?.slice(-6) || order.id?.slice(-6)}</h3>
              {getStatusBadge(order.status)}
            </div>
            <div className="order-body">
              <p><strong>Producto:</strong> {order.productName}</p>
              <p><strong>Cantidad:</strong> {order.quantity}</p>
              <p><strong>Total:</strong> ${order.totalPrice}</p>
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

      {orders.length === 0 && !loading && (
        <p className="no-orders">No tenés órdenes activas</p>
      )}
    </div>
  );
}
