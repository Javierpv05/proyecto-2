import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { authClient as apiClient } from '../../api/client';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/registro', {
        ...formData,
        rol: 'cliente',
        tenant_id: import.meta.env.VITE_TENANT_ID
      }, { requiresAuth: false });
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-header">
          <h1 className="login-title" style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-text)' }}>Crear cuenta</h1>
          <p className="login-subtitle">Únete y pide en segundos</p>
        </div>

        {error && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', textAlign: 'center', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleRegister} className="login-form">
          <Input
            name="nombre"
            placeholder="Nombre completo"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
          />
          <Input
            name="telefono"
            placeholder="Teléfono (Opcional)"
            value={formData.telefono}
            onChange={handleChange}
          />
          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="login-btn">
            Crear mi cuenta
          </Button>
        </form>

        <div className="login-footer">
          <p>¿Ya tienes cuenta?</p>
          <Link to="/login" className="login-link">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
};
