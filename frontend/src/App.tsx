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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/menu" replace />} />
          
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Register />} />
          
          <Route path="menu" element={<Menu />} />
          <Route path="pedido" element={<PedidoTracker />} />
          <Route path="pedido/:pedido_id" element={<PedidoTracker />} />
          
          <Route path="perfil" element={<Perfil />} />
          <Route path="perfil/editar" element={<PerfilEditar />} />

          {/* Admin Routes */}
          <Route path="admin/productos" element={<ProductosAdmin />} />
          <Route path="admin/productos/nuevo" element={<ProductoForm />} />
          <Route path="admin/productos/:id" element={<ProductoForm />} />
          <Route path="admin/pedidos" element={<PedidosAdmin />} />

          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
