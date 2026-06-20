import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { crearPedido } from '../api'

export default function Cart() {
  const { items, updateQty, removeItem, clearCart, total, count } = useCart()
  const [clienteNombre, setClienteNombre] = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)
  const navigate                          = useNavigate()

  const handleConfirmar = async () => {
    if (!clienteNombre.trim()) {
      setError('El nombre del cliente es obligatorio para registrar la orden.')
      return
    }
    if (items.length === 0) {
      setError('No hay elementos en el carrito.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const pedidoItems = items.map(i => ({
        producto_id:     i.producto_id,
        cantidad:        i.cantidad,
        precio_unitario: Number(i.precio),
      }))

      const { data } = await crearPedido({
        clienteNombre: clienteNombre.trim(),
        items:         pedidoItems,
        total,
      })

      clearCart()
      navigate(`/pedido/${data.pedido_id}`, {
        state: { clienteNombre: clienteNombre.trim() }
      })
    } catch (err) {
      setError('No se pudo procesar la solicitud del pedido. Reintente de nuevo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (count === 0 && !loading) return (
    <div className="container tb-section">
      <div className="tb-empty">
        <h3>El carrito de compra está vacío</h3>
        <p className="text-muted">Añada productos del menú para iniciar su orden de compra.</p>
        <button className="btn-tb-red btn btn-md mt-3" onClick={() => navigate('/')}>
          Volver al Menú
        </button>
      </div>
    </div>
  )

  return (
    <div className="container tb-section">
      <h2 className="tb-section-heading">Detalle de tu <span>Orden</span></h2>

      <div className="row g-4">
        {/* Items list */}
        <div className="col-lg-8">
          {items.map(item => (
            <div key={item.producto_id} className="tb-cart-item">
              <div className="flex-grow-1">
                <div className="tb-cart-item-name">{item.nombre}</div>
                <div className="tb-cart-item-price">
                  S/ {(Number(item.precio) * item.cantidad).toFixed(2)}
                  <span style={{ color: 'var(--color-muted)', fontWeight: 400, fontSize: '.85rem', marginLeft: '8px' }}>
                    (S/ {Number(item.precio).toFixed(2)} c/u)
                  </span>
                </div>
              </div>

              {/* Qty control */}
              <div className="qty-control">
                <button className="qty-btn" onClick={() => updateQty(item.producto_id, -1)}>−</button>
                <span className="qty-value">{item.cantidad}</span>
                <button className="qty-btn" onClick={() => updateQty(item.producto_id, +1)}>+</button>
              </div>

              <button
                className="btn-outline-tb btn btn-sm py-1 px-2 ms-2"
                onClick={() => removeItem(item.producto_id)}
                title="Eliminar producto"
              >
                Eliminar
              </button>
            </div>
          ))}

          {/* Order form */}
          <div className="tb-card mt-4">
            <div className="tb-card-body tb-form">
              <h5 className="fw-bold mb-3">Información del Cliente</h5>

              <div className="mb-3">
                <label htmlFor="cliente-nombre">Nombre Completo</label>
                <input
                  id="cliente-nombre"
                  type="text"
                  className="form-control"
                  placeholder="Ingrese su nombre y apellido"
                  value={clienteNombre}
                  onChange={e => setClienteNombre(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConfirmar()}
                />
              </div>

              {error && (
                <div className="text-danger mt-2" style={{ fontSize: '.9rem' }}>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary panel */}
        <div className="col-lg-4">
          <div className="tb-summary">
            <div className="tb-summary-title">Resumen de Orden</div>

            {items.map(item => (
              <div key={item.producto_id} className="tb-summary-row">
                <span>{item.nombre} (x{item.cantidad})</span>
                <span>S/ {(Number(item.precio) * item.cantidad).toFixed(2)}</span>
              </div>
            ))}

            <div className="tb-summary-total">
              <span>Total</span>
              <span className="tb-total-price">S/ {total.toFixed(2)}</span>
            </div>

            <button
              id="btn-confirmar-pedido"
              className="btn-tb-yellow btn w-100 mt-4"
              onClick={handleConfirmar}
              disabled={loading}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Procesando...</>
                : 'Confirmar Pedido'
              }
            </button>

            <button
              className="btn-outline-tb btn w-100 mt-2"
              onClick={() => navigate('/')}
            >
              Volver al Menú
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
