import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { listarPedidos } from '../api'

const PedidosContext = createContext(null)

const POLL_MS = Number(import.meta.env.VITE_POLL_INTERVAL) || 8000

export function PedidosProvider({ children }) {
  const [pedidos, setPedidos]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [lastSync, setLastSync]   = useState(null)
  const intervalRef               = useRef(null)

  const fetchPedidos = useCallback(async () => {
    try {
      const { data } = await listarPedidos()
      const lista = data.pedidos || data.items || []
      // Ordenar por fecha_creacion descendente
      lista.sort((a, b) => (b.fecha_creacion || '').localeCompare(a.fecha_creacion || ''))
      setPedidos(lista)
      setLastSync(new Date())
      setError(null)
    } catch (err) {
      setError('No se pudo cargar la lista de pedidos.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPedidos()
    intervalRef.current = setInterval(fetchPedidos, POLL_MS)
    return () => clearInterval(intervalRef.current)
  }, [fetchPedidos])

  // Actualización optimista: reemplaza un pedido en el estado local
  const actualizarPedidoLocal = useCallback((pedidoId, cambios) => {
    setPedidos(prev =>
      prev.map(p => p.pedido_id === pedidoId ? { ...p, ...cambios } : p)
    )
  }, [])

  // Contar pedidos por estado
  const conteo = pedidos.reduce((acc, p) => {
    acc[p.estado] = (acc[p.estado] || 0) + 1
    return acc
  }, {})

  return (
    <PedidosContext.Provider value={{
      pedidos, loading, error, lastSync,
      fetchPedidos, actualizarPedidoLocal, conteo,
    }}>
      {children}
    </PedidosContext.Provider>
  )
}

export const usePedidos = () => useContext(PedidosContext)
