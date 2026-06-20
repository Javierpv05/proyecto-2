import { useEffect, useState } from 'react'
import { usePedidos } from '../context/PedidosContext'

export default function Topbar() {
  const [time, setTime] = useState(new Date())
  const { lastSync, loading } = usePedidos()

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="topbar">
      <div className="topbar-title">Gestión de Pedidos</div>
      <div className="topbar-right">
        {loading && <span className="spinner-border spinner-border-sm text-muted" />}
        <div className="d-flex align-items-center gap-2">
          <div className="refresh-dot" />
          <span className="topbar-time" style={{ fontSize: '.75rem' }}>
            Sync: {lastSync ? lastSync.toLocaleTimeString() : '--:--:--'}
          </span>
        </div>
        <div className="topbar-time">
          {time.toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
