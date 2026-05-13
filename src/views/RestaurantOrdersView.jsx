// RestaurantOrdersView - Vista para que restaurants gestionen SUS órdenes
// Solo los usuarios con rol 'restaurant' pueden acceder
import React, { useEffect, useState } from 'react';
import { useOrdersViewModel } from '../viewmodels/useOrdersViewModel';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';

export function RestaurantOrdersView({ onNavigate }) {
  const { orders, getMyOrders, cancelOrder, confirmOrder, markAsPreparing, markAsReady, completeOrder, loading, error } = useOrdersViewModel();
  const { user, isAuthenticated } = useAuthViewModel();
  const [filterStatus, setFilterStatus] = useState('all');

  // Validar que solo restaurants puedan acceder
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'restaurant') {
      alert('Esta vista es solo para restaurantes');
      onNavigate?.('catalog');
    }
  }, [isAuthenticated, user?.role, onNavigate]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'restaurant') {
      getMyOrders();
    }
  }, [getMyOrders, isAuthenticated, user?.role]);

  const handleStatusChange = async (orderId, newStatus, actionName) => {
    if (!window.confirm(`¿Confirmar que querés ${actionName} esta orden?`)) {
      return;
    }

    let result;
    switch (newStatus) {
      case 'confirm':
        result = await confirmOrder(orderId);
        break;
      case 'preparing':
        result = await markAsPreparing(orderId);
        break;
      case 'ready':
        result = await markAsReady(orderId);
        break;
      case 'complete':
        result = await completeOrder(orderId);
        break;
      default:
        return;
    }

    if (result.success) {
      alert(`Orden ${actionName} exitosamente`);
      await getMyOrders(); // Recargar
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleCancel = async (orderId) => {
    const result = await cancelOrder(orderId);
    if (result.success) {
      alert('Orden cancelada');
      await getMyOrders();
    } else {
      alert(`Error al cancelar: ${result.error}`);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: '#f59e0b',      // Amarillo
      confirmed: '#3b82f6',    // Azul
      preparing: '#8b5cf6',    // Violeta
      ready: '#10b981',        // Verde claro
      completed: '#059669',    // Verde oscuro
      cancelled: '#ef4444',    // Rojo
    };
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      preparing: 'En Preparación',
      ready: 'Lista para Retirar',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };
    return (
      <span style={{ 
        background: colors[status] || '#6b7280', 
        color: '#fff', 
        padding: '4px 12px', 
        borderRadius: '12px', 
        fontSize: '0.75rem',
        fontWeight: 'bold',
        textTransform: 'uppercase'
      }}>
        {labels[status] || status}
      </span>
    );
  };

  // Validar que orders sea un array antes de operar
  const ordersArray = Array.isArray(orders) ? orders : [];
  
  // Si no es restaurant, no mostrar nada
  if (isAuthenticated && user?.role !== 'restaurant') {
    return (
      <div className="restaurant-orders-container" style={{ padding: '20px', textAlign: 'center' }}>
        <p>Redirigiendo...</p>
      </div>
    );
  }
  
  const filteredOrders = filterStatus === 'all' 
    ? ordersArray 
    : ordersArray.filter(order => order.status === filterStatus);

  // Calcular cantidades por estado
  const statusCounts = ordersArray.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="restaurant-orders-container" style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Gestión de Órdenes del Restaurante</h1>
      
      {/* Filtros por estado */}
      <div className="status-filters" style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => setFilterStatus('all')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            background: filterStatus === 'all' ? '#3b82f6' : '#e5e7eb',
            color: filterStatus === 'all' ? '#fff' : '#374151',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Todas ({ordersArray.length})
        </button>
        <button 
          onClick={() => setFilterStatus('pending')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            background: filterStatus === 'pending' ? '#f59e0b' : '#e5e7eb',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Pendientes ({statusCounts.pending || 0})
        </button>
        <button 
          onClick={() => setFilterStatus('confirmed')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            background: filterStatus === 'confirmed' ? '#3b82f6' : '#e5e7eb',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Confirmadas ({statusCounts.confirmed || 0})
        </button>
        <button 
          onClick={() => setFilterStatus('preparing')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            background: filterStatus === 'preparing' ? '#8b5cf6' : '#e5e7eb',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          En Preparación ({statusCounts.preparing || 0})
        </button>
        <button 
          onClick={() => setFilterStatus('ready')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            background: filterStatus === 'ready' ? '#10b981' : '#e5e7eb',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Listas ({statusCounts.ready || 0})
        </button>
        <button 
          onClick={() => setFilterStatus('completed')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            background: filterStatus === 'completed' ? '#059669' : '#e5e7eb',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Completadas ({statusCounts.completed || 0})
        </button>
      </div>

      {loading && <div className="loading" style={{ textAlign: 'center', padding: '40px' }}>Cargando órdenes...</div>}
      {error && <div className="error-message" style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredOrders.map(order => (
          <div key={order._id} className="order-card" style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div className="order-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: 0 }}>Orden #{order._id?.slice(-6)}</h3>
              {getStatusBadge(order.status)}
            </div>
            
            <div className="order-body" style={{ marginBottom: '16px' }}>
              <p style={{ margin: '8px 0' }}><strong>Cliente:</strong> {order.customerName || 'N/A'}</p>
              {order.customerPhone && <p style={{ margin: '8px 0' }}><strong>Teléfono:</strong> {order.customerPhone}</p>}
              {order.notes && <p style={{ margin: '8px 0' }}><strong>Notas:</strong> {order.notes}</p>}
              
              <div style={{ 
                background: '#f9fafb', 
                padding: '12px', 
                borderRadius: '8px',
                marginTop: '12px'
              }}>
                <strong>Items:</strong>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  {order.items?.map((item, idx) => (
                    <li key={idx} style={{ margin: '4px 0' }}>
                      {item.name} x{item.quantity} - ${item.price * item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
              
              <p style={{ 
                margin: '12px 0', 
                fontSize: '1.2rem', 
                fontWeight: 'bold',
                color: '#059669'
              }}>
                Total: ${order.totalAmount}
              </p>
              
              <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#6b7280' }}>
                Creada: {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            
            {/* Botones de acción según estado */}
            <div className="order-actions" style={{ 
              display: 'flex', 
              gap: '8px',
              flexWrap: 'wrap',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              {order.status === 'pending' && (
                <>
                  <button 
                    onClick={() => handleStatusChange(order._id, 'confirm', 'confirmar')}
                    className="btn-primary"
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      background: '#3b82f6',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ✓ Confirmar Orden
                  </button>
                  <button 
                    onClick={() => handleCancel(order._id)}
                    className="btn-danger"
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      background: '#ef4444',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                </>
              )}
              {order.status === 'confirmed' && (
                <button 
                  onClick={() => handleStatusChange(order._id, 'preparing', 'marcar como en preparación')}
                  className="btn-primary"
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#8b5cf6',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🍳 En Preparación
                </button>
              )}
              {order.status === 'preparing' && (
                <button 
                  onClick={() => handleStatusChange(order._id, 'ready', 'marcar como lista')}
                  className="btn-primary"
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#10b981',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ✓ Lista para Retirar
                </button>
              )}
              {order.status === 'ready' && (
                <button 
                  onClick={() => handleStatusChange(order._id, 'complete', 'completar')}
                  className="btn-primary"
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#059669',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ✓ Completar Orden
                </button>
              )}
              {(order.status === 'pending' || order.status === 'confirmed') && (
                <button 
                  onClick={() => handleCancel(order._id)}
                  className="btn-danger"
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#ef4444',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar Orden
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && !loading && (
        <p className="no-orders" style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#6b7280',
          fontSize: '1.1rem'
        }}>
          No hay órdenes {filterStatus !== 'all' ? `con estado "${filterStatus}"` : 'para mostrar'}
        </p>
      )}
    </div>
  );
}
