import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { type Product } from '../../components/ProductCard';
import { catalogoClient as apiClient } from '../../api/client';
import './AdminTable.css';

export const ProductosAdmin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const data = await apiClient.get<{ items: any[] }>('/productos');
      const items = Array.isArray(data?.items) ? data.items : [];
      setProducts(items.map(p => ({ ...p, id: p.producto_id })));
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await apiClient.delete(`/productos/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Error al eliminar producto');
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '16px', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
        Admin &gt; Catálogo de platos
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)' }}>Catálogo de platos</h1>
        <Link to="/admin/productos/nuevo">
          <Button variant="primary">+ Nuevo plato</Button>
        </Link>
      </div>

      {error ? (
        <EmptyState title="Error" subtitle={error} icon="❌" />
      ) : products.length === 0 ? (
        <EmptyState title="Agrega tu primer plato al menú" icon="🍜" />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.imagen_url ? (
                      <img src={p.imagen_url} alt={p.nombre} className="admin-thumb" />
                    ) : (
                      <div className="admin-thumb-placeholder" />
                    )}
                  </td>
                  <td style={{ fontWeight: 500 }}>{p.nombre}</td>
                  <td>S/. {p.precio.toFixed(2)}</td>
                  <td>
                    <span className={`admin-status-pill ${p.disponible ? 'activo' : 'inactivo'}`}>
                      {p.disponible ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/admin/productos/${p.id}`}>
                      <Button variant="secondary" size="sm">Editar</Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}>🗑</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
