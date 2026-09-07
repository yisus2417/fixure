'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Registro() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
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

      if (usuarios.find((u: any) => u.email === email)) {
        setError('Este email ya está registrado');
        setLoading(false);
        return;
      }

      const nuevoUsuario = {
        id: Date.now().toString(),
        email,
        nombre,
        createdAt: Date.now()
      };

      usuarios.push(nuevoUsuario);
      localStorage.setItem('futsal_usuarios', JSON.stringify(usuarios));
      localStorage.setItem('futsal_current_user', JSON.stringify(nuevoUsuario));
      router.push('/dashboard');
    } catch (err) {
      setError('Error al registrar');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Crea tu cuenta</h1>
        <p className="auth-subtitle">Empieza a crear fixtures en segundos</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Tu nombre</label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Carlos Ramos"
              required
            />
          </div>

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

          <button type="submit" className="btn btn-success w-full" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? <span className="loading" /> : '⚡ Crear Cuenta'}
          </button>

          <p className="text-muted text-center" style={{ fontSize: '0.82rem', marginTop: '1rem' }}>
            🔒 Tus datos están seguros. Solo tú puedes ver tus torneos.
          </p>
        </form>

        <p className="auth-link">
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
