import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { avanzarPaso } from '../api'

const ACTION_MAP = {
  RECIBIDO: { next: 'COCINA', label: 'Cocinar', variant: 'COCINA' },
  COCINA:   { next: 'DESPACHO', label: 'Despachar', variant: 'DESPACHO' },
  DESPACHO: { next: 'REPARTO', label: 'Repartir', variant: 'REPARTO' }
}

export default function StepButton({ pedido, onOptimisticUpdate }) {
  const { estado, pedido_id } = pedido
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const action = ACTION_MAP[estado]

  if (!action) {
    return <button className="step-btn step-btn-done" disabled>Completado</button>
  }

  const handleAdvance = async () => {
    try {
      setLoading(true)
      await avanzarPaso({
        pedidoId: pedido_id,
        paso: action.next,
        usuario: 'operador'
      })
      
      onOptimisticUpdate(pedido_id, { estado: action.next })
      addToast(`Pedido ${pedido_id.substring(0, 8)} actualizado a ${action.next}`)
    } catch (err) {
      console.error(err)
      addToast('Error al intentar cambiar el estado del pedido', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      className={`step-btn step-btn-${action.variant}`} 
      onClick={handleAdvance}
      disabled={loading}
    >
      {loading ? 'Procesando...' : action.label}
    </button>
  )
}
