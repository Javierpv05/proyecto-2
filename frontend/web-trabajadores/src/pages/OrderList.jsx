import React, { useState, useMemo } from 'react'
import { usePedidos } from '../context/PedidosContext'
import OrderCard from '../components/OrderCard'

const TABS = ['TODOS', 'RECIBIDO', 'COCINA', 'DESPACHO', 'REPARTO', 'ENTREGADO']

export default function OrderList() {
  const [activeTab, setActiveTab] = useState('TODOS')
  const { pedidos, loading, error, actualizarPedidoLocal, conteo } = usePedidos()

  const pedidosFiltrados = useMemo(() => {
    if (activeTab === 'TODOS') return pedidos
    return pedidos.filter(p => p.estado === activeTab)
  }, [pedidos, activeTab])

  const getTabCount = (tab) => {
    if (tab === 'TODOS') return pedidos.length
    return conteo[tab] || 0
  }

  if (loading && pedidos.length === 0) {
    return (
      <div className="tb-spinner-wrap">
        <div className="spinner-border" style={{ color: 'var(--tb-red)', width: '2.5rem', height: '2.5rem' }} />
        <span className="text-muted mt-2">Cargando cola de pedidos...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">Cola de Pedidos</h2>
        {error && (
          <span className="text-danger" style={{ fontSize: '.85rem' }}>
            Aviso: Fallo en la sincronización en vivo.
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="tab-pills">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            <span className="pill-count">{getTabCount(tab)}</span>
          </button>
        ))}
      </div>

      {/* Grid de Pedidos */}
      {pedidosFiltrados.length === 0 ? (
        <div className="tb-empty">
          <h4>No se encontraron pedidos</h4>
          <p className="text-muted" style={{ fontSize: '.9rem' }}>
            Los pedidos de los clientes aparecerán en esta sección de forma automática.
          </p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-xl-2 g-3">
          {pedidosFiltrados.map(pedido => (
            <div key={pedido.pedido_id} className="col">
              <OrderCard 
                pedido={pedido} 
                onOptimisticUpdate={actualizarPedidoLocal} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
