import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/client/Login';
import { Register } from './pages/client/Register';
import { Menu } from './pages/client/Menu';
import { PedidoTracker } from './pages/client/PedidoTracker';
import { Perfil } from './pages/client/Perfil';
import { PerfilEditar } from './pages/client/PerfilEditar';
import { ProductosAdmin } from './pages/admin/Productos';
import { ProductoForm } from './pages/admin/ProductoForm';
import { PedidosAdmin } from './pages/admin/PedidosAdmin';

const RequireTrabajador = ({ children }: { children: ReactNode }) => {
  const rol = localStorage.getItem('rol');
  if (rol !== 'trabajador') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// El trabajador no usa el flujo de cliente (menu/carrito/tracker) — si entra
// a una de esas rutas lo mandamos directo a su panel.
const BlockTrabajador = ({ children }: { children: ReactNode }) => {
  const rol = localStorage.getItem('rol');
  if (rol === 'trabajador') {
    return <Navigate to="/admin/pedidos" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/menu" replace />} />
          
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Register />} />
          
          <Route path="menu" element={<BlockTrabajador><Menu /></BlockTrabajador>} />
          <Route path="pedido" element={<BlockTrabajador><PedidoTracker /></BlockTrabajador>} />
          <Route path="pedido/:pedido_id" element={<BlockTrabajador><PedidoTracker /></BlockTrabajador>} />
          
          <Route path="perfil" element={<Perfil />} />
          <Route path="perfil/editar" element={<PerfilEditar />} />

          {/* Admin Routes (solo rol trabajador) */}
          <Route path="admin/productos" element={<RequireTrabajador><ProductosAdmin /></RequireTrabajador>} />
          <Route path="admin/productos/nuevo" element={<RequireTrabajador><ProductoForm /></RequireTrabajador>} />
          <Route path="admin/productos/:id" element={<RequireTrabajador><ProductoForm /></RequireTrabajador>} />
          <Route path="admin/pedidos" element={<RequireTrabajador><PedidosAdmin /></RequireTrabajador>} />

          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
