import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { apiClient } from '../../api/client';

export const PerfilEditar: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        if (isMounted) {
          setError('No hay sesión activa');
          setIsLoading(false);
        }
        return;
      }
      
      try {
        const data = await apiClient.get<any>('/auth/usuario');
        if (isMounted) {
          setFormData({
            nombre: data.nombre || '',
            telefono: data.telefono || '',
          });
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'No se pudo cargar el perfil');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchUser();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.put('/auth/usuario', formData);
      navigate('/perfil');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return <div className="perfil-page" style={{ textAlign: 'center' }}>Cargando datos...</div>;
  }

  if (error) {
    return (
      <div className="perfil-page" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px' }}>{error}</h2>
        <Link to="/login">
          <Button variant="primary">Iniciar sesión</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="perfil-page">
      <div className="perfil-card">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: '32px', textAlign: 'center' }}>
          Editar perfil
        </h1>

        {error && <div style={{ color: 'var(--color-danger)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
              Nombre
            </label>
            <Input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
              Teléfono
            </label>
            <Input
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Guardar cambios
            </Button>
            <Link to="/perfil" style={{ width: '100%' }}>
              <Button type="button" variant="ghost" style={{ width: '100%' }}>
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
