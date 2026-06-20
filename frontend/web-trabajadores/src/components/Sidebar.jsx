import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-name">
          Taco Bell
        </div>
        <div className="brand-sub">Panel Operaciones</div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-item-label">Menú de Navegación</div>
        
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          Dashboard
        </NavLink>
        
        <NavLink to="/pedidos" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          Cola de Pedidos
        </NavLink>
      </div>

      <div className="sidebar-footer">
        Versión 1.0.0
      </div>
    </div>
  )
}
