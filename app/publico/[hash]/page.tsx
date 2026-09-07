'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { Torneo, Equipo } from '@/lib/types';
import { calcularEstadisticas, ordenarEquipos } from '@/lib/fixture';

export default function VistaPublica({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = use(params);
  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'tabla' | 'partidos'>('tabla');

  useEffect(() => {
    // Buscar en localStorage de todos los usuarios
    const usuarios = JSON.parse(localStorage.getItem('futsal_usuarios') || '[]');
    
    for (const user of usuarios) {
      const stored = localStorage.getItem(`futsal_torneos_${user.id}`);
      if (stored) {
        const torneos: Torneo[] = JSON.parse(stored);
        const encontrado = torneos.find(t => t.comparteHash === hash);
        if (encontrado) {
          // Recalcular estadísticas
          const equiposConStats = calcularEstadisticas(encontrado.equipos, encontrado.partidos);
          setTorneo({ ...encontrado, equipos: equiposConStats });
          setLoading(false);
          return;
        }
      }
    }
    setLoading(false);
  }, [hash]);

  const copiarLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('✓ Link copiado');
  };

  const compartirWhatsApp = () => {
    const texto = `⚽ Mira el fixture "${torneo?.nombre}" en vivo: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="public-page">
        <div className="public-container">
          <div className="text-center">
            <span className="loading" style={{ width: 40, height: 40 }} />
            <p className="mt-3">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!torneo) {
    return (
      <div className="public-page">
        <div className="public-container">
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Fixture no encontrado</h3>
            <p>Este link no es válido o fue eliminado</p>
            <Link href="/" className="btn btn-primary mt-3">
              ⚡ Crear mi Fixture
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const equiposOrdenados = ordenarEquipos(torneo.equipos);

  return (
    <div className="public-page">
      <div className="public-container">
        <div className="public-header">
          <div className="hero-badge" style={{ marginBottom: '1rem' }}>
            <span>⚽ EN VIVO</span>
          </div>
          <h1 className="public-title">{torneo.nombre}</h1>
          <p className="text-muted">
            {torneo.formato} · {torneo.modalidad} · {torneo.equipos.length} equipos
          </p>

          <div className="public-share">
            <button className="share-btn" onClick={copiarLink}>
              🔗 Copiar Link
            </button>
            <button className="share-btn whatsapp" onClick={compartirWhatsApp}>
              💬 WhatsApp
            </button>
            <Link href="/" className="share-btn">
              ⚡ Crear mi Fixture
            </Link>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'tabla' ? 'active' : ''}`} onClick={() => setTab('tabla')}>
            📊 Tabla de Posiciones
          </button>
          <button className={`tab ${tab === 'partidos' ? 'active' : ''}`} onClick={() => setTab('partidos')}>
            ⚽ Partidos
          </button>
        </div>

        {tab === 'tabla' && (
          <div>
            {equiposOrdenados.length === 0 ? (
              <div className="empty-state">
                <p>Aún no hay equipos registrados</p>
              </div>
            ) : (
              <table className="standings-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Equipo</th>
                    <th>JJ</th>
                    <th>JG</th>
                    <th>JE</th>
                    <th>JP</th>
                    <th>GF</th>
                    <th>GC</th>
                    <th>PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {equiposOrdenados.map((eq, i) => (
                    <tr key={eq.id}>
                      <td className="pos-cell">{i + 1}</td>
                      <td>
                        <div className="team-cell">
                          <span className="team-color-dot" style={{ background: eq.color }} />
                          {eq.nombre}
                        </div>
                      </td>
                      <td>{eq.estadisticas.jugados}</td>
                      <td>{eq.estadisticas.ganados}</td>
                      <td>{eq.estadisticas.empatados}</td>
                      <td>{eq.estadisticas.perdidos}</td>
                      <td>{eq.estadisticas.golesFavor}</td>
                      <td>{eq.estadisticas.golesContra}</td>
                      <td className="points-cell">{eq.estadisticas.puntos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'partidos' && (
          <div>
            {torneo.partidos.length === 0 ? (
              <div className="empty-state">
                <p>Aún no hay partidos generados</p>
              </div>
            ) : (
              torneo.partidos.map(partido => (
                <div key={partido.id} className={`match-card ${partido.estado}`}>
                  <div className="match-teams">
                    <div className="match-team">
                      <span className="match-team-color" style={{ background: partido.colorLocal }} />
                      <span>{partido.nombreLocal}</span>
                    </div>
                    <div className="match-score">
                      {partido.golesLocal} - {partido.golesVisitante}
                    </div>
                    <div className="match-team">
                      <span>{partido.nombreVisitante}</span>
                      <span className="match-team-color" style={{ background: partido.colorVisitante }} />
                    </div>
                  </div>
                  <div className="match-meta">
                    <span className={`match-badge ${partido.estado}`}>
                      {partido.estado === 'finalizado' ? '✓' : partido.estado === 'en_vivo' ? '🔴' : '⏰'} {partido.fase}
                    </span>
                    <span>Jornada {partido.jornada}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <footer className="footer">
          <div className="footer-content">
            <a href="/" className="nav-logo" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
              <span className="nav-logo-icon">⚡</span>
              <span className="nav-logo-text">FutsalFixture</span>
            </a>
            <p>Crea tus fixtures de futsal gratis</p>
            <Link href="/" className="btn btn-primary mt-2">
              ⚡ Crear mi Fixture
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
