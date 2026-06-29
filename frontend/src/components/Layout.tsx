import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomBar } from './BottomBar';

export const Layout: React.FC = () => {
  const location = useLocation();
  const hideBars = location.pathname === '/login' || location.pathname === '/registro';

  if (hideBars) {
    return (
      <div className="layout">
        <main className="content-container">
          <Outlet />
        </main>
      </div>
    );
  }

  const userRole = localStorage.getItem('rol') || 'cliente';
  const cartCount = 0;

  return (
    <div className="layout">
      <Navbar cartCount={cartCount} userRole={userRole} />
      <main className="content-container">
        <Outlet />
      </main>
      {userRole !== 'trabajador' && <BottomBar />}
    </div>
  );
};
