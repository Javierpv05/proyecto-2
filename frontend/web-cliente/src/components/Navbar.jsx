import { NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { count } = useCart()
  const navigate = useNavigate()

  return (
    <nav className="tb-navbar d-flex align-items-center justify-content-between sticky-top">
      {/* Logo corporativo limpio */}
      <div
        className="navbar-brand d-flex align-items-center gap-2"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <span>Taco Bell</span>
        <span className="brand-accent" style={{ fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Portal Clientes
        </span>
      </div>

      {/* Enlaces de navegación */}
      <div className="d-flex align-items-center gap-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link-custom${isActive ? ' active' : ''}`}
        >
          Menú
        </NavLink>

        <NavLink
          to="/carrito"
          className={({ isActive }) => `nav-link-custom${isActive ? ' active' : ''}`}
        >
          Carrito
          {count > 0 && <span className="tb-badge">{count}</span>}
        </NavLink>
      </div>
    </nav>
  )
}
