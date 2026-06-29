import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  cartCount?: number;
  userRole?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount = 0, userRole }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/menu" className="navbar-logo">
          Popeyes
        </Link>
        
        <div className="navbar-links-desktop">
          <Link to="/menu" className={`navbar-link ${isActive('/menu') ? 'active' : ''}`}>Menú</Link>
          <Link to="/pedido" className={`navbar-link ${isActive('/pedido') ? 'active' : ''}`}>Mi Pedido</Link>
          <Link to="/perfil" className={`navbar-link ${isActive('/perfil') ? 'active' : ''}`}>Perfil</Link>
          
          {userRole === 'trabajador' && (
            <Link to="/admin/pedidos" className={`navbar-link ${isActive('/admin') ? 'active' : ''}`}>Admin</Link>
          )}
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
