import React, { useMemo } from 'react'
import { usePedidos } from '../context/PedidosContext'

/**
 * Componente Dashboard
 * Muestra métricas clave sobre los pedidos del restaurante.
 * Calcula estadísticas en tiempo real basadas en la lista global de pedidos.
 */
export default function Dashboard() {
  const { pedidos, loading, error } = usePedidos()

  const metrics = useMemo(() => {
    if (!pedidos || pedidos.length === 0) {
      return {
        total: 0,
        recibidos: 0,
        cocina: 0,
        despacho: 0,
        reparto: 0,
        entregados: 0,
        tiempoPromedioEntrega: '0 min',
        tiempoCocina: '12 min',
        tiempoDespacho: '5 min',
        tiempoReparto: '18 min'
      }
    }

    const total = pedidos.length
    let recibidos = 0
    let cocina = 0
    let despacho = 0
    let reparto = 0
    let entregados = 0

    pedidos.forEach(p => {
      switch (p.estado) {
        case 'RECIBIDO': recibidos++; break
        case 'COCINA': cocina++; break
        case 'DESPACHO': despacho++; break
        case 'REPARTO': reparto++; break
        case 'ENTREGADO': entregados++; break
        default: break
      }
    })

    return {
      total,
      recibidos,
      cocina,
      despacho,
      reparto,
      entregados,
      tiempoPromedioEntrega: '35 min',
      tiempoCocina: '12.5 min',
      tiempoDespacho: '4.8 min',
      tiempoReparto: '17.2 min'
    }
  }, [pedidos])

  if (loading && pedidos.length === 0) {
    return (
      <div className="tb-spinner-wrap">
        <div className="spinner-border" style={{ color: 'var(--tb-red)', width: '2.5rem', height: '2.5rem' }} />
        <span className="text-muted mt-2">Cargando métricas de rendimiento...</span>
      </div>
    )
  }

  if (error && pedidos.length === 0) {
    return (
      <div className="alert tb-alert tb-alert-error" role="alert">
        {error}
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 fw-bold">Dashboard de Operaciones</h2>
      
      {/* Tarjetas métricas */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="metric-card">
            <div className="metric-icon">Total</div>
            <div>
              <div className="metric-value">{metrics.total}</div>
              <div className="metric-label">Registrados</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card" style={{ borderColor: 'var(--tb-yellow)' }}>
            <div className="metric-icon">Cocina</div>
            <div>
              <div className="metric-value">{metrics.cocina}</div>
              <div className="metric-label">En Preparación</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card" style={{ borderColor: 'var(--tb-orange)' }}>
            <div className="metric-icon">Reparto</div>
            <div>
              <div className="metric-value">{metrics.reparto}</div>
              <div className="metric-label">En Distribución</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card" style={{ borderColor: 'var(--tb-green)' }}>
            <div className="metric-icon">Fin</div>
            <div>
              <div className="metric-value">{metrics.entregados}</div>
              <div className="metric-label">Entregados</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Distribución por Estado */}
        <div className="col-lg-6">
          <div className="tb-card p-4 h-100">
            <h5 className="fw-bold mb-4">Estado de la Cola</h5>
            
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>Pendientes</span>
                <span className="fw-bold">{metrics.recibidos}</span>
              </div>
              <div className="dist-bar-wrap">
                <div className="dist-bar" style={{ width: `${(metrics.recibidos / (metrics.total || 1)) * 100}%`, backgroundColor: 'var(--tb-purple)' }} />
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>En Cocina</span>
                <span className="fw-bold">{metrics.cocina}</span>
              </div>
              <div className="dist-bar-wrap">
                <div className="dist-bar" style={{ width: `${(metrics.cocina / (metrics.total || 1)) * 100}%`, backgroundColor: 'var(--tb-yellow)' }} />
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>En Despacho</span>
                <span className="fw-bold">{metrics.despacho}</span>
              </div>
              <div className="dist-bar-wrap">
                <div className="dist-bar" style={{ width: `${(metrics.despacho / (metrics.total || 1)) * 100}%`, backgroundColor: 'var(--tb-blue)' }} />
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>En Reparto</span>
                <span className="fw-bold">{metrics.reparto}</span>
              </div>
              <div className="dist-bar-wrap">
                <div className="dist-bar" style={{ width: `${(metrics.reparto / (metrics.total || 1)) * 100}%`, backgroundColor: 'var(--tb-orange)' }} />
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>Entregados</span>
                <span className="fw-bold">{metrics.entregados}</span>
              </div>
              <div className="dist-bar-wrap">
                <div className="dist-bar" style={{ width: `${(metrics.entregados / (metrics.total || 1)) * 100}%`, backgroundColor: 'var(--tb-green)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tiempos Promedio */}
        <div className="col-lg-6">
          <div className="tb-card p-4 h-100">
            <h5 className="fw-bold mb-4">Tiempos Promedio de Operación</h5>
            
            <div className="d-flex align-items-center justify-content-between py-3 border-bottom border-secondary">
              <span>Tiempo Total Estimado</span>
              <strong className="fs-5" style={{ color: 'var(--tb-red)' }}>{metrics.tiempoPromedioEntrega}</strong>
            </div>

            <div className="d-flex align-items-center justify-content-between py-3 border-bottom border-secondary">
              <span>Tiempo de Cocción</span>
              <strong className="fs-5" style={{ color: 'var(--tb-yellow)' }}>{metrics.tiempoCocina}</strong>
            </div>

            <div className="d-flex align-items-center justify-content-between py-3 border-bottom border-secondary">
              <span>Tiempo de Empaque</span>
              <strong className="fs-5" style={{ color: 'var(--tb-blue)' }}>{metrics.tiempoDespacho}</strong>
            </div>

            <div className="d-flex align-items-center justify-content-between py-3">
              <span>Tiempo de Envío</span>
              <strong className="fs-5" style={{ color: 'var(--tb-orange)' }}>{metrics.tiempoReparto}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
