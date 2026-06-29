import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StatusStepper } from '../../components/StatusStepper';
import { Badge, type OrderStatus } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { EmptyState } from '../../components/EmptyState';
import { apiClient } from '../../api/client';
import './PedidoTracker.css';

interface PedidoData {
  id: string;
  cliente_nombre: string;
  estado: OrderStatus;
  items: Array<{ nombre: string; cantidad: number; precio: number }>;
  total: number;
}

export const PedidoTracker: React.FC = () => {
  const { pedido_id } = useParams<{ pedido_id: string }>();
  const navigate = useNavigate();
  
  const [pedido, setPedido] = useState<PedidoData | null>(null);
  const [isLoading, setIsLoading] = useState(!!pedido_id);
  const [error, setError] = useState<string | null>(null);
  
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    if (!pedido_id) return;

    let isMounted = true;
    
    const fetchPedido = async () => {
      try {
        const data = await apiClient.get<PedidoData>(`/pedidos/${pedido_id}`, { requiresAuth: false });
        if (isMounted) {
          setPedido(data);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'No se pudo cargar el pedido');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPedido();

    // Polling cada 15 segundos
    const interval = setInterval(fetchPedido, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pedido_id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/pedido/${searchId.trim()}`);
    }
  };

  if (!pedido_id) {
    return (
      <div className="tracker-page">
        <EmptyState 
          title="Rastrea tu pedido" 
          subtitle="Ingresa el código de tu pedido para ver su estado actual." 
          icon="📦" 
        />
        <form onSubmit={handleSearch} style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', gap: '12px', marginTop: '24px' }}>
          <Input 
            placeholder="Ej: abc-123-def" 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button type="submit" variant="primary">Buscar</Button>
        </form>
      </div>
    );
  }

  if (isLoading) {
    return <div className="tracker-page" style={{ textAlign: 'center', marginTop: '40px' }}>Cargando pedido...</div>;
  }

  if (error || !pedido) {
    return (
      <div className="tracker-page">
        <EmptyState 
          title="Pedido no encontrado" 
          subtitle={error || "Verifica que el código ingresado sea correcto."} 
          icon="❌" 
        />
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Button variant="secondary" onClick={() => navigate('/pedido')}>Buscar otro pedido</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="tracker-page">
      <div className="tracker-header">
        <h1 className="tracker-title">Tu pedido</h1>
        <p className="tracker-subtitle">Pedido #{pedido.id}</p>
      </div>

      <div className="tracker-stepper-container">
        <StatusStepper currentStatus={pedido.estado} />
      </div>

      <div className="tracker-status-box">
        <span className="status-label">Estado actual:</span>
        <Badge status={pedido.estado} />
      </div>

      <div className="tracker-summary">
        <h2 className="summary-title">Resumen del pedido</h2>
        <div className="summary-items">
          {pedido.items?.map((item, idx) => (
            <div key={idx} className="summary-item">
              <span>{item.cantidad}x {item.nombre}</span>
              <span>S/. {(item.precio * item.cantidad).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="summary-total">
          <span>Total</span>
          <span>S/. {pedido.total?.toFixed(2)}</span>
        </div>
      </div>
      
      {pedido.estado === 'ENTREGADO' && (
        <div className="tracker-success-message">
          🎉 ¡Tu pedido llegó! Buen provecho 🎉
        </div>
      )}
    </div>
  );
};
