import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ShoppingCart, User } from 'lucide-react';
import './BottomBar.css';

export const BottomBar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="bottom-bar">
      <Link to="/menu" className={`bottom-bar-item ${isActive('/menu') ? 'active' : ''}`}>
        <Menu size={24} />
        <span>Menú</span>
      </Link>
      <Link to="/pedido" className={`bottom-bar-item ${isActive('/pedido') && !location.pathname.match(/pedido\/.+/) ? 'active' : ''}`}>
        <ShoppingCart size={24} />
        <span>Pedido</span>
      </Link>
      <Link to="/perfil" className={`bottom-bar-item ${isActive('/perfil') ? 'active' : ''}`}>
        <User size={24} />
        <span>Perfil</span>
      </Link>
    </div>
  );
};
