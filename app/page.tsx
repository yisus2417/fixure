'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('futsal_current_user');
    if (stored) {
      const user = JSON.parse(stored);
      setUsuario(user.nombre);
    }
  }, []);

  return (
    <main>
      <nav className="navbar">
        <div className="nav-container">
          <a href="/" className="nav-logo">
            <span className="nav-logo-icon">⚡</span>
            <span className="nav-logo-text">FutsalFixture</span>
          </a>
          <ul className="nav-links">
            <li><a href="#features">Características</a></li>
            <li><a href="#como-funciona">Cómo Funciona</a></li>
            {usuario ? (
              <>
                <li><Link href="/dashboard">{usuario}</Link></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); localStorage.removeItem('futsal_current_user'); window.location.reload(); }}>Salir</a></li>
              </>
            ) : (
              <>
                <li><Link href="/login">Iniciar Sesión</Link></li>
                <li><Link href="/registro" className="nav-cta">Empezar Gratis</Link></li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span>🇵🇪 HECHO EN PERÚ</span>
          </div>
          <h1>
            Crea <span className="highlight">Fixtures de Futsal</span> en Segundos
          </h1>
          <p>
            Genera calendarios automáticos para torneos de futsal. 
            Compártelos por link y sigue los resultados en tiempo real. 
            <strong>Sin registro, sin complicaciones.</strong>
          </p>
          <div className="hero-buttons">
            <Link href="/registro" className="btn btn-primary btn-large">
              ⚡ Crear mi Fixture
            </Link>
            <a href="#como-funciona" className="btn btn-secondary btn-large">
              ▶ Cómo Funciona
            </a>
          </div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '1.5rem' }}>
            ✓ 100% gratis &nbsp;·&nbsp; ✓ Sin límite de torneos &nbsp;·&nbsp; ✓ Comparte por WhatsApp
          </p>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">100%</div>
            <div className="stat-label">Gratis</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">∞</div>
            <div className="stat-label">Torneos</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">1</div>
            <div className="stat-label">Click para compartir</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Disponibilidad</div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-label">Características</span>
            <h2 className="section-title">Todo lo que necesitas para tu torneo</h2>
            <p className="section-subtitle">
              Simple como una calculadora. Genera, comparte y sigue en tiempo real.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Generación Automática</h3>
              <p>Ingresa los equipos y el sistema genera el fixture completo al instante. Round-robin, eliminación o grupos.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Link Compartible</h3>
              <p>Cada fixture tiene un link único. Compártalo por WhatsApp y todos verán resultados en tiempo real.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Tabla en Vivo</h3>
              <p>Posiciones, goles a favor, en contra y puntos. Todo actualizado al instante.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>100% Móvil</h3>
              <p>Funciona perfecto en el celular. Sin descargas, sin instalaciones. Solo abre y usa.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Múltiples Formatos</h3>
              <p>Liga todos contra todos, eliminación directa, fase de grupos. Para futsal 5, futsal, fútbol 5 y más.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💾</div>
              <h3>Sin Cuenta</h3>
              <p>Puedes usarlo sin registrarte. Los datos se guardan en tu navegador. Regístrate para más funciones.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="section-container">
          <div className="section-header">
            <span className="section-label">Cómo Funciona</span>
            <h2 className="section-title">Tu fixture en 3 pasos</h2>
            <p className="section-subtitle">Tan fácil que no necesitas instrucciones</p>
          </div>

          <div className="features-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="feature-card">
              <div className="feature-icon">1</div>
              <h3>Crea el Fixture</h3>
              <p>Ingresa el nombre del torneo y lista los equipos participantes.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">2</div>
              <h3>Genera el Calendario</h3>
              <p>El sistema crea el fixture automáticamente según el formato elegido.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">3</div>
              <h3>Comparte y Actualiza</h3>
              <p>Copia el link y compártelo. Cuando registres resultados, todos lo verán.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-container" style={{ textAlign: 'center' }}>
          <h2 className="section-title">¿Listo para crear tu fixture?</h2>
          <p className="section-subtitle">Empieza ahora, sin registro obligatorio</p>
          <div className="hero-buttons" style={{ marginTop: '2rem' }}>
            <Link href="/registro" className="btn btn-primary btn-large">
              ⚡ Crear Fixture Gratis
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <a href="/" className="nav-logo" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            <span className="nav-logo-icon">⚡</span>
            <span className="nav-logo-text">FutsalFixture</span>
          </a>
          <p>Plataforma gratuita para crear fixtures de futsal</p>
          <ul className="footer-links">
            <li><a href="/registro">Crear Fixture</a></li>
            <li><a href="/login">Iniciar Sesión</a></li>
          </ul>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
            © 2024 FutsalFixture · Hecho con ⚡ en Perú 🇵🇪
          </p>
        </div>
      </footer>
    </main>
  );
}
