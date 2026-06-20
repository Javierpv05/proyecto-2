import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProductos } from '../api'
import { useCart } from '../context/CartContext'

// Determinar categoría para visualización textual limpia
function getCategoryTag(nombre = '') {
  const n = nombre.toLowerCase()
  if (n.includes('taco'))       return 'Taco'
  if (n.includes('burrito'))    return 'Burrito'
  if (n.includes('nachos'))     return 'Nachos'
  if (n.includes('quesadilla')) return 'Quesadilla'
  if (n.includes('bebida') || n.includes('refresco') || n.includes('agua')) return 'Bebida'
  if (n.includes('combo'))      return 'Combo'
  if (n.includes('postre') || n.includes('helado')) return 'Postre'
  return 'Especial'
}

export default function ProductList() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [added, setAdded]         = useState({})
  const { addItem }               = useCart()
  const navigate                  = useNavigate()

  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await getProductos()
      setProductos(data.items || data.productos || [])
    } catch (err) {
      setError('No se pudo cargar el catálogo. Por favor verifique el estado del microservicio.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProductos() }, [fetchProductos])

  const handleAdd = (producto) => {
    const category = getCategoryTag(producto.nombre)
    addItem({ ...producto, category })
    setAdded(prev => ({ ...prev, [producto.producto_id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [producto.producto_id]: false })), 1200)
  }

  if (loading) return (
    <div className="tb-spinner-wrap">
      <div className="spinner-border" style={{ color: 'var(--color-primary)', width:'2.5rem', height:'2.5rem' }} />
      <span className="text-muted mt-2">Cargando menú...</span>
    </div>
  )

  if (error) return (
    <div className="container tb-section">
      <div className="tb-alert d-flex flex-column align-items-start gap-3">
        <strong className="text-danger">Error de Conexión</strong>
        <p className="mb-0 text-muted">{error}</p>
        <button className="btn-tb-red btn" onClick={fetchProductos}>Reintentar</button>
      </div>
    </div>
  )

  return (
    <>
      <div className="tb-hero">
        <h1>Catálogo de Productos</h1>
        <p>Seleccione sus productos preferidos para iniciar su orden</p>
      </div>

      <div className="container tb-section">
        {productos.length === 0 ? (
          <div className="tb-empty">
            <h3>No hay productos cargados</h3>
            <p className="text-muted">El catálogo no contiene productos disponibles en este momento.</p>
          </div>
        ) : (
          <div className="row g-4">
            {productos.map(p => {
              const category = getCategoryTag(p.nombre)
              return (
                <div key={p.producto_id} className="col-sm-6 col-md-4 col-lg-3">
                  <div className="tb-card">
                    <div className="tb-card-img-placeholder">
                      {category}
                    </div>
                    <div className="tb-card-body">
                      <div className="tb-card-title">{p.nombre}</div>
                      {p.descripcion && (
                        <div className="tb-card-desc">{p.descripcion}</div>
                      )}
                      <div className="d-flex align-items-center justify-content-between mt-auto pt-2">
                        <span className="tb-card-price">S/ {Number(p.precio).toFixed(2)}</span>
                        <button
                          className={`btn-tb-red btn btn-sm ${added[p.producto_id] ? 'btn-tb-yellow' : ''}`}
                          onClick={() => handleAdd(p)}
                          disabled={p.disponible === false}
                        >
                          {added[p.producto_id] ? 'Agregado' : 'Agregar'}
                        </button>
                      </div>
                      {p.disponible === false && (
                        <div className="mt-2 text-danger" style={{ fontSize: '.75rem', fontWeight: 600 }}>
                          Agotado
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {productos.length > 0 && (
          <div className="text-center mt-5">
            <button className="btn-tb-yellow btn btn-lg" onClick={() => navigate('/carrito')}>
              Ver Carrito de Compra
            </button>
          </div>
        )}
      </div>
    </>
  )
}
