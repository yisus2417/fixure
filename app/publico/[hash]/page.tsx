'use client';

import { useState, useEffect } from 'react';
import { Torneo, Equipo } from '@/lib/types';
import { calcularEstadisticas, ordenarEquipos } from '@/lib/fixture';
import LlaveEliminacion from '@/components/LlaveEliminacion';

export default function VistaPublica({ params }: { params: { hash: string } }) {
  const { hash } = params;
  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarTorneo = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/torneo/${hash}`);
      if (res.ok) {
        const torneoKV = await res.json();
        const equiposConStats = calcularEstadisticas(torneoKV.equipos, torneoKV.partidos);
        setTorneo({ ...torneoKV, equipos: equiposConStats });
        setLoading(false);
        return;
      } else {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
    } catch (e) {
      console.error('Error al cargar el torneo desde Upstash:', e);
      setError(
        'No se pudo cargar el fixture. Puede que aún no se haya guardado en la nube o que el enlace sea incorrecto.'
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTorneo();
    const interval = setInterval(cargarTorneo, 500);
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
      </div>
    </div>
  );
}
