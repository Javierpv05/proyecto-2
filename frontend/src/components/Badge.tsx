import React from 'react';
import './Badge.css';

export type OrderStatus = 'RECIBIDO' | 'EN_COCINA' | 'EN_DESPACHO' | 'EN_REPARTO' | 'ENTREGADO';

interface BadgeProps {
  status: OrderStatus;
}

const statusMap: Record<OrderStatus, { text: string; colorClass: string }> = {
  RECIBIDO: { text: 'Recibido', colorClass: 'badge-recibido' },
  EN_COCINA: { text: 'En preparación', colorClass: 'badge-cocina' },
  EN_DESPACHO: { text: 'En camino', colorClass: 'badge-despacho' },
  EN_REPARTO: { text: 'En reparto', colorClass: 'badge-reparto' },
  ENTREGADO: { text: 'Entregado ✓', colorClass: 'badge-entregado' },
};

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const { text, colorClass } = statusMap[status] || { text: status, colorClass: '' };

  return <span className={`badge ${colorClass}`}>{text}</span>;
};
