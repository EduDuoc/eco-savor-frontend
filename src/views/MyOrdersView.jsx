// MyOrdersView - View Layer (MVVM Pattern) - Diseño actualizado 2026
import React, { useEffect } from 'react';
import { useOrdersViewModel } from '../modules/index.js';

export function MyOrdersView() {
  const { orders, getMyOrders, cancelOrder, loading, error } = useOrdersViewModel();

  useEffect(() => {
    const loadOrders = async () => {
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
      <span style={{ 
        background: colors[status], 
        color: '#fff', 
        padding: '4px 12px', 
        borderRadius: '99px', 
        fontSize: '0.8rem',
        fontWeight: '600'
      }}>
        {status}
      </span>
    );
  };

  const getEmojiForProduct = (name) => {
    const nameLower = name?.toLowerCase() || '';
    
    if (nameLower.includes('palta')) return '🥑';
    if (nameLower.includes('tomate')) return '🍅';
    if (nameLower.includes('manzana')) return '🍎';
    if (nameLower.includes('pizza')) return '🍕';
    if (nameLower.includes('sushi')) return '🍣';
    if (nameLower.includes('burger')) return '🍔';
    
    return '🥡';
  };

  return (
    <div className="orders-container">
      <h1>Mis pedidos</h1>

      {loading && <div className="loading">Cargando órdenes...</div>}
      {error && <div className="error-message">⚠️ {error}</div>}

      {(!orders || (Array.isArray(orders) && orders.length === 0)) && !loading ? (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h2>Sin pedidos aún</h2>
          <p>Confirmá tu primer pedido desde el carrito</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders && Array.isArray(orders) && orders.map((order) => (
            <div key={order._id || order.id} className="order-card">
              <div className="order-header">
                <h3>Pedido #{(order._id || order.id)?.slice(-6)}</h3>
                {getStatusBadge(order.status)}
              </div>
              <div className="order-body">
                {/* Lista de items */}
                <div className="order-items">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <div key={item.productId || idx} className="order-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>{getEmojiForProduct(item.name)}</span>
                          <div>
                            <p style={{ margin: 0, fontWeight: '600' }}>{item.name}</p>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                              Cantidad: {item.quantity} × ${item.price}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Sin productos</p>
                  )}
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <p style={{ margin: 0, color: '#64748b' }}>
                    {new Date(order.reservedAt || order.createdAt).toLocaleDateString('es-CL')}
                  </p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '1.25rem', 
                    fontWeight: '700', 
                    color: '#064e3b' 
                  }}>
                    Total: ${order.totalAmount?.toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
              {order.status === 'pending' && (
                <button 
                  onClick={() => handleCancel(order._id || order.id)} 
                  className="btn-danger"
                  style={{ marginTop: '1rem' }}
                >
                  Cancelar Orden
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
