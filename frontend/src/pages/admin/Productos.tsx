import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { type Product } from '../../components/ProductCard';
import { apiClient } from '../../api/client';

export const ProductosAdmin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const data = await apiClient.get<Product[]>('/productos');
      setProducts(Array.isArray(data) ? data : []);
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
        <div style={{ overflowX: 'auto', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '16px' }}>Nombre</th>
                <th style={{ padding: '16px' }}>Precio</th>
                <th style={{ padding: '16px' }}>Estado</th>
                <th style={{ padding: '16px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px' }}>{p.nombre}</td>
                  <td style={{ padding: '16px' }}>S/. {p.precio.toFixed(2)}</td>
                  <td style={{ padding: '16px' }}>
                    {p.disponible ? '✅ Activo' : '❌ Inactivo'}
                  </td>
                  <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
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
