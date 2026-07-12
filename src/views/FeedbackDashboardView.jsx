// FeedbackDashboardView - Panel de Gerente para ver Mejoras y Felicitaciones
import React, { useEffect, useState } from 'react';
import { useAuthViewModel } from '../modules/index.js';
import api from '../services/api';

const TYPE_LABELS = {
  felicitacion: 'Felicitacion',
  mejora: 'Sugerencia de mejora',
  general: 'Comentario general',
};

const TYPE_COLORS = {
  felicitacion: '#059669',
  mejora: '#f59e0b',
  general: '#3b82f6',
};

export function FeedbackDashboardView({ onNavigate }) {
  const { user, isAuthenticated } = useAuthViewModel();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) return;

    if (user?.role !== 'admin') {
      alert('Esta vista es solo para gerentes generales');
      onNavigate?.('catalog');
      return;
    }

    loadFeedback();
  }, [isAuthenticated, user?.role, onNavigate]);

  const loadFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/feedback');
      const payload = response.data?.data || [];
      setFeedbackList(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error('Error al cargar feedback:', err);
      setError('No se pudieron cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async (id) => {
    try {
      await api.put(`/feedback/${id}/reviewed`);
      setFeedbackList((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: 'reviewed' } : item))
      );
    } catch (err) {
      console.error('Error al marcar como revisado:', err);
      alert('No se pudo actualizar el estado');
    }
  };

  if (!isAuthenticated) return null;

  const filteredList = feedbackList.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = feedbackList.filter((item) => item.status === 'pending').length;

  const cardStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '16px',
  };

  const selectStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.9rem',
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '8px' }}>Mejoras y Felicitaciones</h1>
      <p style={{ marginBottom: '20px', color: '#64748b' }}>
        {feedbackList.length} mensaje{feedbackList.length !== 1 ? 's' : ''} en total
        {pendingCount > 0 && (
          <span style={{ color: '#f59e0b', fontWeight: 'bold' }}> - {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''} de revision</span>
        )}
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={selectStyle}>
          <option value="all">Todos los tipos</option>
          <option value="felicitacion">Felicitaciones</option>
          <option value="mejora">Sugerencias de mejora</option>
          <option value="general">Comentarios generales</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="reviewed">Revisados</option>
        </select>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Cargando mensajes...</div>}
      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {!loading && filteredList.length === 0 && (
        <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No hay mensajes que coincidan con el filtro.</p>
      )}

      {filteredList.map((item) => (
        <div key={item._id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  background: TYPE_COLORS[item.type] || '#64748b',
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                }}
              >
                {TYPE_LABELS[item.type] || item.type}
              </span>
              <h3 style={{ margin: '4px 0', color: '#1f2937' }}>{item.name}</h3>
            </div>
            {item.status === 'pending' ? (
              <button
                onClick={() => handleMarkReviewed(item._id)}
                style={{
                  padding: '6px 14px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#3b82f6',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                }}
              >
                Marcar como revisado
              </button>
            ) : (
              <span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 'bold' }}>Revisado</span>
            )}
          </div>

          <p style={{ margin: '8px 0', color: '#374151' }}>{item.message}</p>

          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.85rem', color: '#6b7280', flexWrap: 'wrap' }}>
            <span>Correo: {item.email}</span>
            {item.phone && <span>Telefono: {item.phone}</span>}
            <span>{new Date(item.createdAt).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}