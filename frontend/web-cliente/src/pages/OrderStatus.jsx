import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { consultarEstado } from '../api'

// Pasos en el tracker con números como identificadores profesionales
const STEPS = [
  { key: 'RECIBIDO',  label: 'Recibido',  num: '1' },
  { key: 'COCINA',    label: 'Cocina',    num: '2' },
  { key: 'DESPACHO',  label: 'Despacho',  num: '3' },
  { key: 'REPARTO',   label: 'Reparto',   num: '4' },
  { key: 'ENTREGADO', label: 'Entregado', num: '5' },
]

const STEP_INDEX = Object.fromEntries(STEPS.map((s, i) => [s.key, i]))

const PROGRESS = {
  RECIBIDO:  10,
  COCINA:    35,
  DESPACHO:  60,
  REPARTO:   82,
  ENTREGADO: 100,
}

const MENSAJES = {
  RECIBIDO:  'Su pedido ha sido registrado correctamente y está en cola de espera.',
  COCINA:    'El personal de cocina ha iniciado la preparación de los productos.',
  DESPACHO:  'Los productos han sido preparados y están siendo empaquetados para el envío.',
  REPARTO:   'El repartidor ha tomado su orden y se encuentra en ruta hacia su dirección.',
  ENTREGADO: 'El pedido ha sido entregado correctamente. Gracias por su preferencia.',
}

const POLLING_INTERVAL = 5000

export default function OrderStatus() {
  const { id }       = useParams()
  const location     = useLocation()
  const navigate     = useNavigate()
  const clienteNom   = location.state?.clienteNombre || 'Cliente'

  const [pedido, setPedido]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const intervalRef = useRef(null)

  const fetchEstado = useCallback(async () => {
    try {
      const { data } = await consultarEstado(id)
      setPedido(data)
      setLastUpdate(new Date())
      setError(null)
    } catch (err) {
      if (err.response?.status === 404) {
        setError('El identificador de pedido especificado no existe.')
        clearInterval(intervalRef.current)
      } else {
        setError('Error temporal al consultar el servidor. Intentando reconexión...')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchEstado()
    intervalRef.current = setInterval(fetchEstado, POLLING_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [fetchEstado])

  useEffect(() => {
    if (pedido?.estado === 'ENTREGADO') {
      clearInterval(intervalRef.current)
    }
  }, [pedido?.estado])

  if (loading) return (
    <div className="tb-spinner-wrap">
      <div className="spinner-border" style={{ color: 'var(--color-primary)', width: '2.5rem', height: '2.5rem' }} />
      <span className="text-muted mt-2">Consultando estado del pedido...</span>
    </div>
  )

  if (error && !pedido) return (
    <div className="container tb-section">
      <div className="tb-alert d-flex flex-column align-items-start gap-3">
        <strong className="text-danger">Aviso de Error</strong>
        <p className="mb-0 text-muted">
          Detalle: {error} (ID: <code style={{ color: 'var(--color-primary)' }}>{id}</code>)
        </p>
        <div className="d-flex gap-2">
          <button className="btn-tb-red btn btn-sm" onClick={fetchEstado}>Reintentar</button>
          <button className="btn-outline-tb btn btn-sm" onClick={() => navigate('/')}>Ir al Menú</button>
        </div>
      </div>
    </div>
  )

  const estado     = pedido?.estado || 'RECIBIDO'
  const stepIndex  = STEP_INDEX[estado] ?? 0
  const progreso   = PROGRESS[estado] ?? 10

  return (
    <div className="container tb-section" style={{ maxWidth: 760 }}>
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="tb-section-heading">Estado de tu <span>Pedido</span></h2>
        <p className="text-muted">
          Cliente: <strong style={{ color: 'var(--color-text)' }}>{clienteNom}</strong>
        </p>
      </div>

      {/* Status badge + message */}
      <div className="text-center mb-4">
        <span className={`status-badge status-${estado}`}>{estado}</span>
        <p className="mt-3 text-light" style={{ fontSize: '1.05rem', fontWeight: 500 }}>{MENSAJES[estado]}</p>
        {lastUpdate && (
          <p className="text-muted" style={{ fontSize: '.8rem' }}>
            Sincronizado: {lastUpdate.toLocaleTimeString()}
            {pedido?.estado !== 'ENTREGADO' && ' (Monitoreando cada 5s)'}
          </p>
        )}
      </div>

      {/* Tracker */}
      <div className="status-tracker mb-4">
        {STEPS.map((step, idx) => {
          const isDone    = idx < stepIndex
          const isCurrent = idx === stepIndex
          return (
            <div key={step.key} className="status-step">
              <div className={`step-dot ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                {step.num}
              </div>
              <span className={`step-label ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="tb-progress progress mb-5">
        <div
          className="progress-bar"
          role="progressbar"
          style={{ width: `${progreso}%` }}
          aria-valuenow={progreso}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Pedido details */}
      {pedido && (
        <div className="tb-card">
          <div className="tb-card-body">
            <h5 className="fw-bold mb-3">Resumen Técnico de la Orden</h5>

            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <div style={{ color: 'var(--color-muted)', fontSize: '.8rem' }}>Código del Pedido</div>
                <code style={{ color: 'var(--color-primary)', fontSize: '.9rem' }}>
                  {pedido.pedido_id}
                </code>
              </div>
              <div className="col-sm-6">
                <div style={{ color: 'var(--color-muted)', fontSize: '.8rem' }}>Nombre Registrado</div>
                <div className="fw-semibold">{pedido.cliente_nombre}</div>
              </div>
              <div className="col-sm-6">
                <div style={{ color: 'var(--color-muted)', fontSize: '.8rem' }}>Fecha y Hora de Registro</div>
                <div style={{ fontSize: '.9rem' }}>
                  {pedido.fecha_creacion
                    ? new Date(pedido.fecha_creacion).toLocaleString()
                    : '—'}
                </div>
              </div>
              <div className="col-sm-6">
                <div style={{ color: 'var(--color-muted)', fontSize: '.8rem' }}>Monto Total Facturado</div>
                <div className="fw-bold text-success">
                  S/ {Number(pedido.total).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Items */}
            {pedido.items?.length > 0 && (
              <>
                <hr style={{ borderColor: 'var(--app-border)' }} />
                <div style={{ color: 'var(--color-muted)', fontSize: '.8rem', marginBottom: '.5rem' }}>
                  Lista de Artículos
                </div>
                {pedido.items.map((item, i) => (
                  <div key={i} className="d-flex justify-content-between mb-1" style={{ fontSize: '.9rem' }}>
                    <span>
                      Código de Producto: <code style={{ color: 'var(--color-muted)' }}>{item.producto_id}</code>{' '}
                      <span className="text-muted">x{item.cantidad}</span>
                    </span>
                    <span>S/ {(Number(item.precio_unitario) * item.cantidad).toFixed(2)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="text-center mt-4">
        <button className="btn-tb-red btn" onClick={() => navigate('/')}>
          Realizar una Nueva Orden
        </button>
      </div>
    </div>
  )
}
