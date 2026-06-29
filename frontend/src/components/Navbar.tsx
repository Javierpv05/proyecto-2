import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, ClipboardList, UtensilsCrossed, LogOut } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  cartCount?: number;
  userRole?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount = 0, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname.startsWith(path);
  const esTrabajador = userRole === 'trabajador';

  // Salir del panel de trabajador cierra la sesion (no solo navega) — si
  // alguien vuelve a entrar a /admin, va a tener que loguearse de nuevo.
  const handleSalir = () => {
    localStorage.removeItem('id_token');
    localStorage.removeItem('rol');
    navigate('/menu');
  };

  if (esTrabajador) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/admin/pedidos" className="navbar-logo">
            Popeyes <span className="navbar-role-badge">Panel trabajador</span>
          </Link>

          <div className="navbar-links-desktop">
            <Link to="/admin/pedidos" className={`navbar-link ${isActive('/admin/pedidos') ? 'active' : ''}`}>Pedidos</Link>
            <Link to="/admin/productos" className={`navbar-link ${isActive('/admin/productos') ? 'active' : ''}`}>Productos</Link>
            <Link to="/perfil" className={`navbar-link ${isActive('/perfil') ? 'active' : ''}`}>Mi cuenta</Link>
            <button onClick={handleSalir} className="navbar-link navbar-link-button">Salir / Ver menú</button>
          </div>

          <div className="navbar-actions-mobile">
            <Link to="/admin/pedidos" className="navbar-profile-icon">
              <ClipboardList size={24} />
            </Link>
            <Link to="/admin/productos" className="navbar-profile-icon">
              <UtensilsCrossed size={24} />
            </Link>
            <Link to="/perfil" className="navbar-profile-icon">
              <User size={24} />
            </Link>
            <button onClick={handleSalir} className="navbar-profile-icon navbar-icon-button">
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/menu" className="navbar-logo">
          Popeyes
        </Link>

        <div className="navbar-links-desktop">
          <Link to="/menu" className={`navbar-link ${isActive('/menu') ? 'active' : ''}`}>Menú</Link>
          <Link to="/pedido" className={`navbar-link ${isActive('/pedido') ? 'active' : ''}`}>Mi Pedido</Link>
          <Link to="/perfil" className={`navbar-link ${isActive('/perfil') ? 'active' : ''}`}>
            {userRole ? 'Perfil' : 'Acceso trabajador'}
          </Link>
        </div>

        <div className="navbar-actions-mobile">
          <Link to="/pedido" className="navbar-cart-icon">
            <ShoppingCart size={24} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          <Link to="/perfil" className="navbar-profile-icon">
            <User size={24} />
          </Link>
        </div>
      </div>
    </nav>
  );
};
