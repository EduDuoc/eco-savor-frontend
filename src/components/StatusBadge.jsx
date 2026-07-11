// StatusBadge - Badge de estado de una orden, compartido entre vistas
import React from 'react';

const COLORS = {
  pending: '#f59e0b',      // Amarillo
  confirmed: '#3b82f6',    // Azul
  preparing: '#8b5cf6',    // Violeta
  ready: '#10b981',        // Verde claro
  completed: '#059669',    // Verde oscuro
  cancelled: '#ef4444',    // Rojo
};

const LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  preparing: 'En Preparación',
  ready: 'Lista para Retirar',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

// showLabel=false (por defecto): comportamiento original de MyOrdersView
// (fondo sin fallback, texto = status crudo).
// showLabel=true: comportamiento original de RestaurantOrdersView
// (fondo con fallback gris, texto = label legible, mayúsculas).
export function StatusBadge({ status, showLabel = false }) {
  if (showLabel) {
    return (
      <span style={{
        background: COLORS[status] || '#6b7280',
        color: '#fff',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
      }}>
        {LABELS[status] || status}
      </span>
    );
  }

  return (
    <span style={{
      background: COLORS[status],
      color: '#fff',
      padding: '4px 12px',
      borderRadius: '99px',
      fontSize: '0.8rem',
      fontWeight: '600',
    }}>
      {status}
    </span>
  );
}
