import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { apiClient } from '../../api/client';
import './Perfil.css';

interface UserProfile {
  nombre: string;
  email: string;
  telefono?: string;
  rol: string;
}

export const Perfil: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        const data = await apiClient.get<UserProfile>('/auth/usuario');
        if (isMounted) {
          setUser(data);
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

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    // Clear tokens
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  if (isLoading) {
    return <div className="perfil-page" style={{ textAlign: 'center' }}>Cargando perfil...</div>;
  }

  if (error || !user) {
    return (
      <div className="perfil-page">
        <div style={{ textAlign: 'center' }}>
          <EmptyState title="No has iniciado sesión" subtitle="Inicia sesión para ver tu perfil y pedidos." icon="👤" />
          <Link to="/login">
            <Button variant="primary">Iniciar sesión</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-page">
      <div className="perfil-card">
        <div className="perfil-header">
          <div className="perfil-avatar">
            {getInitials(user.nombre)}
          </div>
          <h1 className="perfil-name">{user.nombre}</h1>
          <p className="perfil-email">{user.email}</p>
        </div>

        <div className="perfil-info">
          <div className="perfil-info-divider">
            <span>Mi información</span>
          </div>
          
          <div className="perfil-info-grid">
            <div className="info-label">Nombre:</div>
            <div className="info-value">{user.nombre}</div>
            
            <div className="info-label">Teléfono:</div>
            <div className="info-value">{user.telefono || '-'}</div>
            
            <div className="info-label">Rol:</div>
            <div className="info-value">{user.rol}</div>
          </div>
        </div>

        <div className="perfil-actions">
          <Link to="/perfil/editar" style={{ width: '100%' }}>
            <Button variant="secondary" style={{ width: '100%' }}>
              ✏ Editar perfil
            </Button>
          </Link>
          <Button variant="ghost" className="danger-text" style={{ width: '100%' }} onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
};
