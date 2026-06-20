import axios from 'axios'

const CATALOGO_API = import.meta.env.VITE_CATALOGO_API
const PEDIDOS_API  = import.meta.env.VITE_PEDIDOS_API
const TENANT_ID    = import.meta.env.VITE_TENANT_ID || 'taco-bell'

// ── Catálogo ──────────────────────────────────────────────────────────────
export const getProductos = () =>
  axios.get(`${CATALOGO_API}/productos`, {
    params: { tenant_id: TENANT_ID },
  })

// ── Pedidos ───────────────────────────────────────────────────────────────
export const crearPedido = ({ clienteNombre, items, total }) =>
  axios.post(`${PEDIDOS_API}/pedidos`, {
    tenant_id:      TENANT_ID,
    cliente_nombre: clienteNombre,
    items,
    total,
  })

export const consultarEstado = (pedidoId) =>
  axios.get(`${PEDIDOS_API}/pedidos/${pedidoId}`, {
    params: { tenant_id: TENANT_ID },
  })
