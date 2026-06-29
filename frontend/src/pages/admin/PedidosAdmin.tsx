import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Badge, type OrderStatus } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { pedidosClient, workflowClient } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import './AdminTable.css';

const tabs = ['Todos', 'Recibidos', 'En cocina', 'En despacho', 'En reparto', 'Entregados'];
const tabToStatusMap: Record<string, string> = {
  'Todos': '',
  'Recibidos': 'RECIBIDO',
  'En cocina': 'EN_COCINA',
  'En despacho': 'EN_DESPACHO',
  'En reparto': 'EN_REPARTO',
  'Entregados': 'ENTREGADO'
};

interface Pedido {
  id: string;
  cliente_nombre?: string;
  cliente?: string;
  cliente_telefono?: string;
  total: number;
  estado: OrderStatus;
}

export const PedidosAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [observation, setObservation] = useState('');

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPedidos = async () => {
    setIsLoading(true);
    try {
      const statusParam = tabToStatusMap[activeTab];
      const endpoint = statusParam ? `/pedidos/estado/${statusParam}` : '/pedidos';
      const data = await pedidosClient.get<{ pedidos: any[] }>(endpoint);
      const pedidos = Array.isArray(data?.pedidos) ? data.pedidos : [];
      setPedidos(pedidos.map(p => ({ ...p, id: p.pedido_id })));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    // Refresh every 20 seconds
    const interval = setInterval(fetchPedidos, 20000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleAvanzar = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setObservation('');
    setIsModalOpen(true);
  };

  const handleConfirmAvanzar = async () => {
    if (!selectedPedido) return;
    setIsSubmitting(true);
    
    // El valor de 'paso' debe ser el paso PENDIENTE ahora mismo (el que está
    // esperando confirmacion en Step Functions), no el siguiente estado.
    // RECIBIDO y EN_COCINA -> el paso pendiente es COCINA; EN_DESPACHO -> DESPACHO; EN_REPARTO -> REPARTO.
    const pasoPorEstado: Record<string, string> = {
      RECIBIDO: 'COCINA',
      EN_COCINA: 'COCINA',
      EN_DESPACHO: 'DESPACHO',
      EN_REPARTO: 'REPARTO',
    };
    const nextStep = pasoPorEstado[selectedPedido.estado] || 'COCINA';

    try {
      await workflowClient.post('/pasos/avanzar', {
        tenant_id: import.meta.env.VITE_TENANT_ID,
        pedido_id: selectedPedido.id,
        paso: nextStep,
        observacion: observation
      });
      setIsModalOpen(false);
      fetchPedidos();
    } catch (err) {
      alert('Error al avanzar pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '16px', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
        Admin &gt; Pedidos
      </div>
      
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: '24px' }}>Pedidos</h1>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ color: 'var(--color-muted)' }}>Cargando pedidos...</div>
      ) : error ? (
        <EmptyState title="Error" subtitle={error} icon="❌" />
      ) : pedidos.length === 0 ? (
        <EmptyState title="No hay pedidos" subtitle="No se encontraron pedidos en este estado." icon="📦" />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(p => (
                <tr key={p.id}>
                  <td className="admin-id">{p.id.substring(0, 8)}</td>
                  <td>{p.cliente_nombre || p.cliente}</td>
                  <td>
                    {p.cliente_telefono ? (
                      <a href={`tel:${p.cliente_telefono}`} style={{ color: 'var(--color-info)' }}>{p.cliente_telefono}</a>
                    ) : '-'}
                  </td>
                  <td style={{ fontWeight: 600 }}>S/. {p.total?.toFixed(2)}</td>
                  <td>
                    <Badge status={p.estado} />
                  </td>
                  <td>
                    {p.estado !== 'ENTREGADO' && (
                      <Button variant="primary" size="sm" onClick={() => handleAvanzar(p)}>Avanzar</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Avanzar pedido #${selectedPedido?.id.substring(0, 8)}`}>
        {selectedPedido && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>Cliente: {selectedPedido.cliente_nombre || selectedPedido.cliente}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>Estado actual:</span>
                <Badge status={selectedPedido.estado} />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: 'var(--text-base)', marginBottom: '8px' }}>Próximo paso:</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="radio" checked readOnly />
                <label>
                  {selectedPedido.estado === 'RECIBIDO' ? 'EN COCINA' :
                   selectedPedido.estado === 'EN_COCINA' ? 'EN DESPACHO' :
                   selectedPedido.estado === 'EN_DESPACHO' ? 'EN REPARTO' : 'ENTREGADO'}
                </label>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--text-sm)' }}>Observación (opcional):</label>
              <textarea 
                rows={3}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-body)',
                  resize: 'vertical'
                }}
                placeholder="Notas del paso"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <Button variant="primary" onClick={handleConfirmAvanzar} isLoading={isSubmitting}>
                ✅ Marcar como completado
              </Button>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
