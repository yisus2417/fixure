'use client';

import { useState, useEffect } from 'react';
import { Torneo, Equipo } from '@/lib/types';
import { calcularEstadisticas, ordenarEquipos } from '@/lib/fixture';
import LlaveEliminacion from '@/components/LlaveEliminacion';

export default function VistaPublica({ params }: { params: { hash: string } }) {
  const { hash } = params;
  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarTorneo = async () => {
    try {
      const res = await fetch(`/api/torneo/${hash}`);
      if (res.ok) {
        const torneoKV = await res.json();
        const equiposConStats = calcularEstadisticas(torneoKV.equipos, torneoKV.partidos);
        setTorneo({ ...torneoKV, equipos: equiposConStats });
        setLoading(false);
        return;
      }
    } catch (e) {
      console.log('KV no disponible, buscando en localStorage');
    }

    const usuarios = JSON.parse(localStorage.getItem('futsal_usuarios') || '[]');

    for (const user of usuarios) {
      const stored = localStorage.getItem(`futsal_torneos_${user.id}`);
      if (stored) {
        const torneos: Torneo[] = JSON.parse(stored);
        const encontrado = torneos.find(t => t.comparteHash === hash);
        if (encontrado) {
          const equiposConStats = calcularEstadisticas(encontrado.equipos, encontrado.partidos);
          setTorneo({ ...encontrado, equipos: equiposConStats });
          setLoading(false);
          return;
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarTorneo();
    const interval = setInterval(cargarTorneo, 5000);
    return () => clearInterval(interval);
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
          </div>
        </div>

        <div className="tabs">
          <button className={`tab active`}>
            ⚽ Partidos
          </button>
        </div>

        {torneo.partidos.length === 0 ? (
          <div className="empty-state">
            <p>Aún no hay partidos generados</p>
          </div>
        ) : torneo.formato === 'eliminacion' ? (
          <LlaveEliminacion
            partidos={torneo.partidos}
            faseActual=""
            soloLectura={true}
          />
        ) : (
          <div>
            {torneo.partidos.map(partido => (
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
                  {partido.hora && <span>🕐 {partido.hora}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="footer">
          <div className="footer-content">
            <span className="nav-logo" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
              <span className="nav-logo-icon">⚡</span>
              <span className="nav-logo-text">FutsalFixture</span>
            </span>
            <p>Actualiza automáticamente cada 5 segundos</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
