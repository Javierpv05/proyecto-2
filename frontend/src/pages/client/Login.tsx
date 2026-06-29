import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { apiClient } from '../../api/client';
import './Login.css';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<any>('/auth/login', { email, password }, { requiresAuth: false });
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
      }
      navigate('/menu');
    } catch (err: any) {
      setError(err.message || 'Email o contraseña incorrectos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-header">
          <h1 className="login-title">Madam Tusan</h1>
          <p className="login-subtitle">El sabor de siempre</p>
        </div>

        {error && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', textAlign: 'center', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="login-btn">
            Ingresar
          </Button>
        </form>

        <div className="login-footer">
          <p>¿No tienes cuenta?</p>
          <Link to="/registro" className="login-link">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
};
