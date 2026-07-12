// AdminDashboardView - Dashboard para el rol admin/gerente general
import React, { useEffect, useMemo, useState } from 'react';
import { useOrdersViewModel, useAuthViewModel } from '../modules/index.js';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

const DAY_HOURS_LABEL = (hour) => {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour < 12 ? 'AM' : 'PM';
  return `${h}:00 ${suffix}`;
};

const DAY_OF_WEEK_LABEL = {
  1: 'Domingo',
  2: 'Lunes',
  3: 'Martes',
  4: 'Miércoles',
  5: 'Jueves',
  6: 'Viernes',
  7: 'Sábado',
};

const STATUS_LABELS = {
  pending: 'Pendientes',
  confirmed: 'Confirmadas',
  preparing: 'En preparación',
  ready: 'Listas',
  completed: 'Completadas',
  cancelled: 'Anuladas',
};

const CARD_STYLE = {
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '20px',
  background: '#fff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

export function AdminDashboardView({ onNavigate }) {
  const { orders, getMyOrders, loading: ordersLoading, error: ordersError } = useOrdersViewModel();
  const { user, isAuthenticated } = useAuthViewModel();
  const [section, setSection] = useState('stores'); // 'stores' | 'customers'

  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [restaurantsError, setRestaurantsError] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState(null);

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [customerStatsLoading, setCustomerStatsLoading] = useState(false);
  const [customerStatsError, setCustomerStatsError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (user?.role !== 'admin') {
      alert('Esta vista es solo para gerentes generales');
      onNavigate?.('catalog');
      return;
    }

    const loadData = async () => {
      setRestaurantsLoading(true);
      setRestaurantsError(null);
      setCustomersLoading(true);
      setCustomersError(null);

      try {
        await getMyOrders();

        const [restaurantsRes, usersRes] = await Promise.all([
          api.get('/restaurants'),
          api.get('/users'),
        ]);

        const restaurantsPayload = restaurantsRes.data?.data || restaurantsRes.data?.restaurants || restaurantsRes.data || [];
        setRestaurants(Array.isArray(restaurantsPayload) ? restaurantsPayload : []);

        const usersPayload = usersRes.data?.data || usersRes.data || [];
        const buyersOnly = Array.isArray(usersPayload) ? usersPayload.filter((u) => u.role === 'buyer') : [];
        setCustomers(buyersOnly);
      } catch (error) {
        console.error('Error al cargar dashboard admin:', error);
        setRestaurantsError('No se pudieron cargar las tiendas');
        setCustomersError('No se pudieron cargar los clientes');
      } finally {
        setRestaurantsLoading(false);
        setCustomersLoading(false);
      }
    };

    loadData();
  }, [getMyOrders, isAuthenticated, onNavigate, user?.role]);

  useEffect(() => {
    if (!selectedRestaurant) {
      setStats(null);
      return;
    }

    const restaurantId = selectedRestaurant._id || selectedRestaurant.id;

    const loadStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const response = await api.get(`/orders/restaurants/${restaurantId}/stats`);
        setStats(response.data?.data || null);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        setStatsError('No se pudieron cargar las estadísticas de esta tienda');
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [selectedRestaurant]);

  useEffect(() => {
    if (!selectedCustomer) {
      setCustomerStats(null);
      return;
    }

    const customerId = selectedCustomer._id || selectedCustomer.id;

    const loadCustomerStats = async () => {
      setCustomerStatsLoading(true);
      setCustomerStatsError(null);
      try {
        const response = await api.get(`/orders/customers/${customerId}/stats`);
        setCustomerStats(response.data?.data || null);
      } catch (error) {
        console.error('Error al cargar estadísticas del cliente:', error);
        setCustomerStatsError('No se pudieron cargar las estadísticas de este cliente');
      } finally {
        setCustomerStatsLoading(false);
      }
    };

    loadCustomerStats();
  }, [selectedCustomer]);

  const ordersArray = Array.isArray(orders) ? orders : [];

  const restaurantStats = useMemo(() => {
    return restaurants.map((restaurant) => {
      const restaurantId = restaurant._id || restaurant.id;
      const matchingOrders = ordersArray.filter((order) => {
        const orderRestaurantId = order.restaurantId || order.restaurant?.id || order.restaurant?._id;
        return orderRestaurantId === restaurantId;
      });

      return {
        restaurant,
        totalOrders: matchingOrders.length,
        pendingOrders: matchingOrders.filter((order) => order.status === 'pending').length,
      };
    });
  }, [ordersArray, restaurants]);

  const selectedRestaurantOrders = useMemo(() => {
    if (!selectedRestaurant) return [];
    const restaurantId = selectedRestaurant._id || selectedRestaurant.id;
    return ordersArray.filter((order) => {
      const orderRestaurantId = order.restaurantId || order.restaurant?.id || order.restaurant?._id;
      return orderRestaurantId === restaurantId;
    });
  }, [ordersArray, selectedRestaurant]);

  const todayBreakdown = useMemo(() => {
    if (!stats?.todayStats) return null;

    const result = {
      pending: 0, confirmed: 0, preparing: 0, ready: 0, completed: 0,
      cancelledByBuyer: 0, cancelledByRestaurant: 0,
    };

    stats.todayStats.forEach((entry) => {
      const status = entry._id?.status;
      const cancelledBy = entry._id?.cancelledBy;
      const count = entry.count || 0;

      if (status === 'cancelled') {
        if (cancelledBy === 'restaurant') result.cancelledByRestaurant += count;
        else result.cancelledByBuyer += count;
      } else if (result[status] !== undefined) {
        result[status] += count;
      }
    });

    return result;
  }, [stats]);

  const customerOrderCounts = useMemo(() => {
    const map = {};
    ordersArray.forEach((order) => {
      map[order.userId] = (map[order.userId] || 0) + 1;
    });
    return map;
  }, [ordersArray]);

  const renderRestaurantCard = (stat) => {
    const restaurantName = stat.restaurant.restaurantName || stat.restaurant.name || 'Sin nombre';
    return (
      <div
        key={stat.restaurant._id || stat.restaurant.id}
        onClick={() => setSelectedRestaurant(stat.restaurant)}
        style={{ ...CARD_STYLE, cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
      >
        <h3 style={{ margin: '0 0 8px', color: '#1f2937' }}>{restaurantName}</h3>
        <p style={{ margin: '4px 0', color: '#64748b' }}><strong>Pedidos totales:</strong> {stat.totalOrders}</p>
        <p style={{ margin: '4px 0', color: '#f59e0b' }}><strong>Pendientes:</strong> {stat.pendingOrders}</p>
      </div>
    );
  };

  const renderCustomerCard = (customer) => {
    const customerId = customer._id || customer.id;
    const orderCount = customerOrderCounts[customerId] || 0;
    return (
      <div
        key={customerId}
        onClick={() => setSelectedCustomer(customer)}
        style={{ ...CARD_STYLE, cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
      >
        <h3 style={{ margin: '0 0 8px', color: '#1f2937' }}>{customer.name || 'Sin nombre'}</h3>
        <p style={{ margin: '4px 0', color: '#64748b' }}>{customer.email}</p>
        <p style={{ margin: '4px 0', color: '#3b82f6' }}><strong>Pedidos registrados:</strong> {orderCount}</p>
      </div>
    );
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '12px' }}>Panel de Gerente General</h1>

      {!selectedRestaurant && !selectedCustomer && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', maxWidth: '400px' }}>
          <button
            onClick={() => setSection('stores')}
            style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
              background: section === 'stores' ? '#fff' : 'transparent',
              color: section === 'stores' ? '#059669' : '#64748b',
              fontWeight: section === 'stores' ? 'bold' : 'normal',
              boxShadow: section === 'stores' ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
              cursor: 'pointer',
            }}
          >
            🏪 Tiendas
          </button>
          <button
            onClick={() => setSection('customers')}
            style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
              background: section === 'customers' ? '#fff' : 'transparent',
              color: section === 'customers' ? '#059669' : '#64748b',
              fontWeight: section === 'customers' ? 'bold' : 'normal',
              boxShadow: section === 'customers' ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
              cursor: 'pointer',
            }}
          >
            👥 Clientes
          </button>
        </div>
      )}

      {section === 'stores' && (
        <>
          {(ordersLoading || restaurantsLoading) && !selectedRestaurant && (
            <div style={{ textAlign: 'center', padding: '40px' }}>Cargando tiendas...</div>
          )}
          {restaurantsError && !selectedRestaurant && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{restaurantsError}</div>
          )}

          {!selectedRestaurant ? (
            <>
              <h2 style={{ marginBottom: '16px' }}>Tiendas / Restaurantes</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {restaurantStats.map(renderRestaurantCard)}
              </div>
              {restaurantStats.length === 0 && !ordersLoading && !restaurantsLoading && (
                <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No hay tiendas disponibles.</p>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setSelectedRestaurant(null)}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }}
              >
                ← Volver a todas las tiendas
              </button>

              <h2 style={{ marginBottom: '16px' }}>
                {selectedRestaurant.restaurantName || selectedRestaurant.name || 'la tienda'}
              </h2>

              {statsLoading && <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Cargando estadísticas...</div>}
              {statsError && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{statsError}</div>}

              {stats && !statsLoading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div style={CARD_STYLE}>
                    <h3 style={{ margin: '0 0 12px', color: '#1f2937' }}>📅 Resumen de hoy</h3>
                    {todayBreakdown ? (
                      <div style={{ fontSize: '0.9rem', color: '#374151' }}>
                        <p style={{ margin: '6px 0' }}>🟡 Pendientes: <strong>{todayBreakdown.pending}</strong></p>
                        <p style={{ margin: '6px 0' }}>🔵 Confirmadas: <strong>{todayBreakdown.confirmed}</strong></p>
                        <p style={{ margin: '6px 0' }}>🟣 En preparación: <strong>{todayBreakdown.preparing}</strong></p>
                        <p style={{ margin: '6px 0' }}>🟢 Listas: <strong>{todayBreakdown.ready}</strong></p>
                        <p style={{ margin: '6px 0' }}>✅ Completadas: <strong>{todayBreakdown.completed}</strong></p>
                        <p style={{ margin: '6px 0' }}>❌ Anuladas por cliente: <strong>{todayBreakdown.cancelledByBuyer}</strong></p>
                        <p style={{ margin: '6px 0' }}>🚫 Anuladas por la tienda: <strong>{todayBreakdown.cancelledByRestaurant}</strong></p>
                      </div>
                    ) : <p style={{ color: '#9ca3af' }}>Sin pedidos hoy</p>}
                  </div>

                  <div style={CARD_STYLE}>
                    <h3 style={{ margin: '0 0 12px', color: '#1f2937' }}>💰 Ventas por mes</h3>
                    {stats.salesByMonth?.length > 0 ? (
                      <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ textAlign: 'left', padding: '4px 0' }}>Mes</th>
                            <th style={{ textAlign: 'right', padding: '4px 0' }}>Pedidos</th>
                            <th style={{ textAlign: 'right', padding: '4px 0' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.salesByMonth.map((row) => (
                            <tr key={row._id}>
                              <td style={{ padding: '4px 0' }}>{row._id}</td>
                              <td style={{ textAlign: 'right', padding: '4px 0' }}>{row.count}</td>
                              <td style={{ textAlign: 'right', padding: '4px 0', color: '#059669', fontWeight: 'bold' }}>${row.total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : <p style={{ color: '#9ca3af' }}>Sin ventas completadas todavía</p>}
                  </div>

                  <div style={CARD_STYLE}>
                    <h3 style={{ margin: '0 0 12px', color: '#1f2937' }}>⏰ Horarios de mayor venta</h3>
                    {stats.peakHours?.length > 0 ? (
                      <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
                        {stats.peakHours.slice(0, 5).map((row) => (
                          <li key={row._id} style={{ margin: '4px 0' }}>
                            {DAY_HOURS_LABEL(row._id)} — <strong>{row.count}</strong> pedido{row.count !== 1 ? 's' : ''}
                          </li>
                        ))}
                      </ol>
                    ) : <p style={{ color: '#9ca3af' }}>Sin datos suficientes</p>}
                  </div>

                  <div style={CARD_STYLE}>
                    <h3 style={{ margin: '0 0 12px', color: '#1f2937' }}>🏆 Productos más vendidos</h3>
                    {stats.topProducts?.length > 0 ? (
                      <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
                        {stats.topProducts.map((row) => (
                          <li key={row._id} style={{ margin: '4px 0' }}>
                            {row._id} — <strong>{row.totalQuantity}</strong> unidades (${row.totalRevenue})
                          </li>
                        ))}
                      </ol>
                    ) : <p style={{ color: '#9ca3af' }}>Sin ventas completadas todavía</p>}
                  </div>

                  <div style={CARD_STYLE}>
                    <h3 style={{ margin: '0 0 12px', color: '#1f2937' }}>📊 Histórico por estado</h3>
                    {stats.statusCounts?.length > 0 ? (
                      <div style={{ fontSize: '0.9rem' }}>
                        {stats.statusCounts.map((row) => (
                          <p key={row._id} style={{ margin: '6px 0' }}>{STATUS_LABELS[row._id] || row._id}: <strong>{row.count}</strong></p>
                        ))}
                      </div>
                    ) : <p style={{ color: '#9ca3af' }}>Sin datos aún</p>}
                  </div>
                </div>
              )}

              <h2 style={{ marginBottom: '16px' }}>Pedidos</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedRestaurantOrders.map((order) => (
                  <div key={order._id} style={CARD_STYLE}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
                      <h3 style={{ margin: 0 }}>Orden #{order._id?.slice(-6)}</h3>
                      <StatusBadge status={order.status} showLabel />
                    </div>
                    <p style={{ margin: '8px 0' }}><strong>Cliente:</strong> {order.customerName || 'N/A'}</p>
                    {order.customerPhone && <p style={{ margin: '8px 0' }}><strong>Teléfono:</strong> {order.customerPhone}</p>}
                    {order.status === 'cancelled' && order.cancelledBy && (
                      <p style={{ margin: '8px 0', color: '#dc2626' }}>
                        <strong>Anulado por:</strong> {order.cancelledBy === 'restaurant' ? 'la tienda' : 'el cliente'}
                      </p>
                    )}
                    <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                      <strong>Items:</strong>
                      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        {order.items?.map((item, idx) => (
                          <li key={idx} style={{ margin: '4px 0' }}>{item.name} x{item.quantity} - ${item.price * item.quantity}</li>
                        ))}
                      </ul>
                    </div>
                    {order.notes && <p style={{ margin: '8px 0' }}><strong>Notas:</strong> {order.notes}</p>}
                    <p style={{ margin: '12px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#059669' }}>Total: ${order.totalAmount}</p>
                    <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#6b7280' }}>Creada: {new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              {selectedRestaurantOrders.length === 0 && !ordersLoading && (
                <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No hay pedidos para esta tienda.</p>
              )}
            </>
          )}
        </>
      )}

      {section === 'customers' && (
        <>
          {customersLoading && !selectedCustomer && (
            <div style={{ textAlign: 'center', padding: '40px' }}>Cargando clientes...</div>
          )}
          {customersError && !selectedCustomer && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{customersError}</div>
          )}

          {!selectedCustomer ? (
            <>
              <h2 style={{ marginBottom: '16px' }}>Clientes registrados ({customers.length})</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {customers.map(renderCustomerCard)}
              </div>
              {customers.length === 0 && !customersLoading && (
                <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No hay clientes registrados.</p>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }}
              >
                ← Volver a todos los clientes
              </button>

              <h2 style={{ marginBottom: '4px' }}>{selectedCustomer.name || 'Cliente'}</h2>
              <p style={{ marginBottom: '16px', color: '#64748b' }}>{selectedCustomer.email}</p>

              {customerStatsLoading && <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Cargando actividad...</div>}
              {customerStatsError && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{customerStatsError}</div>}

              {customerStats && !customerStatsLoading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  <div style={CARD_STYLE}>
                    <h3 style={{ margin: '0 0 12px', color: '#1f2937' }}>💰 Resumen de compras</h3>
                    <p style={{ margin: '6px 0', fontSize: '1.3rem', fontWeight: 'bold', color: '#059669' }}>
                      ${customerStats.totalSpent} <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 'normal' }}>gastado en total</span>
                    </p>
                    <p style={{ margin: '6px 0', color: '#374151' }}>
                      <strong>{customerStats.orderCount}</strong> pedido{customerStats.orderCount !== 1 ? 's' : ''} completado{customerStats.orderCount !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div style={CARD_STYLE}>
                    <h3 style={{ margin: '0 0 12px', color: '#1f2937' }}>🏪 Le compra usualmente a</h3>
                    {customerStats.favoriteRestaurants?.length > 0 ? (
                      <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
                        {customerStats.favoriteRestaurants.map((row) => (
                          <li key={row._id} style={{ margin: '4px 0' }}>
                            {row._id} — <strong>{row.count}</strong> pedido{row.count !== 1 ? 's' : ''} (${row.totalSpent})
                          </li>
                        ))}
                      </ol>
                    ) : <p style={{ color: '#9ca3af' }}>Sin compras completadas todavía</p>}
                  </div>

                  <div style={CARD_STYLE}>
                    <h3 style={{ margin: '0 0 12px', color: '#1f2937' }}>📅 Día que suele comprar</h3>
                    {customerStats.dayOfWeekPreference?.length > 0 ? (
                      <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
                        {customerStats.dayOfWeekPreference.slice(0, 3).map((row) => (
                          <li key={row._id} style={{ margin: '4px 0' }}>
                            {DAY_OF_WEEK_LABEL[row._id] || row._id} — <strong>{row.count}</strong> pedido{row.count !== 1 ? 's' : ''}
                          </li>
                        ))}
                      </ol>
                    ) : <p style={{ color: '#9ca3af' }}>Sin datos suficientes</p>}
                  </div>

                  <div style={CARD_STYLE}>
                    <h3 style={{ margin: '0 0 12px', color: '#1f2937' }}>⏰ Horario que suele comprar</h3>
                    {customerStats.hourPreference?.length > 0 ? (
                      <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
                        {customerStats.hourPreference.slice(0, 3).map((row) => (
                          <li key={row._id} style={{ margin: '4px 0' }}>
                            {DAY_HOURS_LABEL(row._id)} — <strong>{row.count}</strong> pedido{row.count !== 1 ? 's' : ''}
                          </li>
                        ))}
                      </ol>
                    ) : <p style={{ color: '#9ca3af' }}>Sin datos suficientes</p>}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
