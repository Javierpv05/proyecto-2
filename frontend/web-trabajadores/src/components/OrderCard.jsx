import StepButton from './StepButton'

const ESTADOS = ['RECIBIDO', 'COCINA', 'DESPACHO', 'REPARTO', 'ENTREGADO']

export default function OrderCard({ pedido, onOptimisticUpdate }) {
  const curStepIdx = ESTADOS.indexOf(pedido.estado)
  
  return (
    <div className="order-card">
      <div className="order-card-header">
        <div>
          <span className="order-id">#{pedido.pedido_id.substring(0, 8)}</span>
          <span className="order-cliente ms-2">{pedido.cliente_nombre}</span>
        </div>
        <div className="order-time">
          {new Date(pedido.fecha_creacion).toLocaleTimeString()}
        </div>
      </div>

      <div className="items-list">
        {pedido.items?.map((item, idx) => (
          <span key={idx} className="item-chip">
            {item.cantidad}x {item.producto_id}
          </span>
        ))}
      </div>

      <div className="step-timeline">
        {ESTADOS.map((est, idx) => (
          <span key={est} className={`step-chip ${idx <= curStepIdx ? 'done' : ''}`}>
            {est}
          </span>
        ))}
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <span className={`estado-badge estado-${pedido.estado}`}>
          {pedido.estado}
        </span>
        <StepButton pedido={pedido} onOptimisticUpdate={onOptimisticUpdate} />
      </div>
    </div>
  )
}
