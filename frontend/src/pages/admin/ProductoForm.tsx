import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { apiClient } from '../../api/client';
import { type Product } from '../../components/ProductCard';

export const ProductoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    disponible: true
  });
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      let isMounted = true;
      const fetchProduct = async () => {
        try {
          const data = await apiClient.get<Product>(`/productos/${id}`);
          if (isMounted) {
            setFormData({
              nombre: data.nombre,
              precio: data.precio.toString(),
              descripcion: data.descripcion || '',
              disponible: data.disponible
            });
          }
        } catch (err: any) {
          if (isMounted) setError(err.message || 'Error al cargar producto');
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };
      fetchProduct();
      return () => { isMounted = false; };
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        precio: parseFloat(formData.precio),
        tenant_id: 'madam-tusan'
      };

      if (isEditing) {
        await apiClient.put(`/productos/${id}`, payload);
      } else {
        await apiClient.post('/productos', payload);
      }
      navigate('/admin/productos');
    } catch (err: any) {
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
        Admin &gt; <Link to="/admin/productos" style={{ color: 'var(--color-primary)' }}>Catálogo de platos</Link> &gt; {isEditing ? 'Editar plato' : 'Nuevo plato'}
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: '32px' }}>
        {isEditing ? 'Editar plato' : 'Nuevo plato'}
      </h1>

      <div style={{ backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
        {error && <div style={{ color: 'var(--color-danger)', marginBottom: '16px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Nombre del plato*</label>
            <Input name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Precio (S/.)*</label>
            <Input type="number" name="precio" value={formData.precio} onChange={handleChange} min="0" step="0.01" required />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Descripción</label>
            <textarea 
              name="descripcion" 
              value={formData.descripcion} 
              onChange={handleChange}
              rows={3}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: 'var(--radius-sm)', 
                border: '1px solid var(--color-border)',
                fontFamily: 'var(--font-body)',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              name="disponible" 
              id="disponible"
              checked={formData.disponible} 
              onChange={handleChange}
            />
            <label htmlFor="disponible">Disponible</label>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Guardar plato</Button>
            <Link to="/admin/productos">
              <Button type="button" variant="ghost">Cancelar</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
