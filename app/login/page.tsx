'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('futsal_current_user');
    if (stored) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const usuarios = JSON.parse(localStorage.getItem('futsal_usuarios') || '[]');
      const user = usuarios.find((u: any) => u.email === email);

      if (!user) {
        setError('Usuario no encontrado. ¿Quieres registrarte?');
        setLoading(false);
        return;
      }

      localStorage.setItem('futsal_current_user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err) {
      setError('Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Bienvenido</h1>
        <p className="auth-subtitle">Ingresa tu email para continuar</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? <span className="loading" /> : 'Continuar'}
          </button>
        </form>

        <p className="auth-link">
          ¿No tienes cuenta? <Link href="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}
