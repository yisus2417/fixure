'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Torneo, Equipo, Partido } from '@/lib/types';
import { generarLigaRoundRobin, generarEliminacion, generarGrupos, calcularEstadisticas, ordenarEquipos, avanzarGanador, iniciarPartido, terminarPartido, actualizarMinuto } from '@/lib/fixture';
import LlaveEliminacion from '@/components/LlaveEliminacion';

function generarId(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

export default function GestionarTorneo({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [tab, setTab] = useState<'equipos' | 'partidos' | 'tabla'>('equipos');
  const [showModalEquipo, setShowModalEquipo] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('futsal_current_user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUsuario(JSON.parse(storedUser));

    const storedTorneos = localStorage.getItem(`futsal_torneos_${JSON.parse(storedUser).id}`);
    const misTorneos: Torneo[] = storedTorneos ? JSON.parse(storedTorneos) : [];
    const encontrado = misTorneos.find(t => t.id === id);

    if (!encontrado) {
      alert('Torneo no encontrado');
      router.push('/dashboard');
      return;
    }
    setTorneo(encontrado);
  }, [id, router]);

  useEffect(() => {
    if (!torneo) return;
    const interval = setInterval(() => {
      const ahora = new Date();
      const partidosEnVivo = torneo.partidos.filter(p => p.estado === 'en_vivo' && p.horaInicio);
      if (partidosEnVivo.length === 0) return;

      let actualizado = false;
      const nuevosPartidos = torneo.partidos.map(p => {
        if (p.estado === 'en_vivo' && p.horaInicio) {
          const [h, m] = p.horaInicio.split(':').map(Number);
          const inicio = new Date();
          inicio.setHours(h, m, 0, 0);
          const diffMin = Math.floor((ahora.getTime() - inicio.getTime()) / 60000);
          if (diffMin !== p.minutoActual && diffMin >= 0 && diffMin <= 120) {
            actualizado = true;
            return { ...p, minutoActual: diffMin };
          }
        }
        return p;
      });

      if (actualizado) {
        guardar({ ...torneo, partidos: nuevosPartidos });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [torneo]);

  const guardar = useCallback(async (actualizado: Torneo) => {
    if (!usuario) return;
    const stored = localStorage.getItem(`futsal_torneos_${usuario.id}`);
    const torneos: Torneo[] = stored ? JSON.parse(stored) : [];
    const idx = torneos.findIndex(t => t.id === actualizado.id);
    if (idx !== -1) {
      torneos[idx] = actualizado;
      localStorage.setItem(`futsal_torneos_${usuario.id}`, JSON.stringify(torneos));
      setTorneo({ ...actualizado });

      try {
        await fetch('/api/torneo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actualizado),
        });
      } catch (e) {
        console.log('KV no disponible, solo localStorage');
      }
    }
  }, [usuario]);

  const agregarEquipo = (nombre: string, color: string) => {
    if (!torneo) return;
    const nuevo: Equipo = {
      id: generarId(),
      nombre,
      color,
      estadisticas: { jugados: 0, ganados: 0, empatados: 0, perdidos: 0, golesFavor: 0, golesContra: 0, puntos: 0 }
    };
    guardar({ ...torneo, equipos: [...torneo.equipos, nuevo] });
    setShowModalEquipo(false);
  };

  const eliminarEquipo = (eqId: string) => {
    if (!torneo) return;
    if (!confirm('¿Eliminar equipo?')) return;
    guardar({
      ...torneo,
      equipos: torneo.equipos.filter(e => e.id !== eqId),
      partidos: torneo.partidos.filter(p => p.local !== eqId && p.visitante !== eqId)
    });
  };

  const generarFixture = () => {
    if (!torneo || torneo.equipos.length < 2) {
      alert('Necesitas al menos 2 equipos');
      return;
    }

    let partidos: Partido[] = [];
    if (torneo.formato === 'liga') {
      partidos = generarLigaRoundRobin(torneo.equipos);
    } else if (torneo.formato === 'eliminacion') {
      partidos = generarEliminacion(torneo.equipos);
    } else {
      partidos = generarGrupos(torneo.equipos, torneo.numGrupos || 2);
    }

    guardar({ ...torneo, partidos, estado: 'activo' });
    alert(`✓ ${partidos.length} partidos generados`);
  };

  const registrarResultado = (partidoId: string, golesLocal: number, golesVisitante: number) => {
    if (!torneo) return;
    const partido = torneo.partidos.find(p => p.id === partidoId);
    if (!partido) return;

    let partidosActualizados = torneo.partidos;

    if (partido.estado === 'pendiente') {
      partidosActualizados = iniciarPartido(partidosActualizados, partidoId);
    }

    partidosActualizados = partidosActualizados.map(p =>
      p.id === partidoId
        ? { ...p, golesLocal, golesVisitante }
        : p
    );

    if (golesLocal >= 0 && golesVisitante >= 0) {
      partidosActualizados = terminarPartido(partidosActualizados, partidoId);
    }

    if (torneo.formato === 'eliminacion') {
      partidosActualizados = avanzarGanador(partidosActualizados, partidoId);
    }

    const actualizado = {
      ...torneo,
      partidos: partidosActualizados
    };

    const equiposConStats = calcularEstadisticas(actualizado.equipos, actualizado.partidos);
    guardar({ ...actualizado, equipos: equiposConStats });
  };

  const iniciarPartidoUI = (partidoId: string) => {
    if (!torneo) return;
    const partido = torneo.partidos.find(p => p.id === partidoId);
    if (!partido || partido.estado !== 'pendiente') return;
    const actualizado = { ...torneo, partidos: iniciarPartido(torneo.partidos, partidoId) };
    guardar(actualizado);
  };

  const terminarPartidoUI = (partidoId: string) => {
    if (!torneo) return;
    const partido = torneo.partidos.find(p => p.id === partidoId);
    if (!partido || partido.estado !== 'en_vivo') return;
    const actualizado = { ...torneo, partidos: terminarPartido(torneo.partidos, partidoId) };
    guardar(actualizado);
  };

  const copiarLink = () => {
    if (!torneo || !baseUrl) return;
    const link = `${baseUrl}/publico/${torneo.comparteHash}`;
    navigator.clipboard.writeText(link);
    alert('✓ Link copiado');
  };

  if (!torneo) return <div className="dashboard"><div className="dashboard-container"><span className="loading" /> Cargando...</div></div>;

  const equiposOrdenados = ordenarEquipos(torneo.equipos);

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">{torneo.nombre}</h1>
            <p className="text-muted">{torneo.formato} · {torneo.modalidad} · {torneo.equipos.length} equipos</p>
          </div>
            <div className="flex gap-1">
            <button onClick={copiarLink} className="btn btn-secondary btn-small">
              🔗 {baseUrl}/publico/{torneo.comparteHash}
            </button>
            <Link href={`/publico/${torneo.comparteHash}`} target="_blank" className="btn btn-secondary btn-small">
              👁 Ver Público
            </Link>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'equipos' ? 'active' : ''}`} onClick={() => setTab('equipos')}>
            👥 Equipos ({torneo.equipos.length})
          </button>
          <button className={`tab ${tab === 'partidos' ? 'active' : ''}`} onClick={() => setTab('partidos')}>
            ⚽ Partidos ({torneo.partidos.length})
          </button>
          <button className={`tab ${tab === 'tabla' ? 'active' : ''}`} onClick={() => setTab('tabla')}>
            📊 Tabla
          </button>
        </div>

        {tab === 'equipos' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2>Equipos</h2>
              <button className="btn btn-primary btn-small" onClick={() => setShowModalEquipo(true)}>
                ➕ Agregar
              </button>
            </div>

            {torneo.equipos.length === 0 ? (
              <div className="empty-state">
                <p>Agrega los equipos para generar el fixture</p>
              </div>
            ) : (
              <div className="torneos-grid">
                {torneo.equipos.map(eq => (
                  <div key={eq.id} className="card">
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ width: 16, height: 16, background: eq.color, borderRadius: 4, display: 'inline-block' }} />
                      <strong>{eq.nombre}</strong>
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                      {eq.estadisticas.jugados} jugados · {eq.estadisticas.puntos} pts
                    </p>
                    <button 
                      onClick={() => eliminarEquipo(eq.id)} 
                      className="btn btn-danger btn-small mt-2"
                      style={{ width: '100%' }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {torneo.equipos.length >= 2 && torneo.partidos.length === 0 && (
              <button className="btn btn-success w-full mt-3" style={{ justifyContent: 'center' }} onClick={generarFixture}>
                ⚡ Generar Fixture ({torneo.formato})
              </button>
            )}
          </div>
        )}

        {tab === 'partidos' && (
          <div>
            <h2 className="mb-3">Partidos</h2>
            {torneo.partidos.length === 0 ? (
              <div className="empty-state">
                <p>Genera el fixture desde la pestaña Equipos</p>
              </div>
            ) : torneo.formato === 'eliminacion' ? (
              <LlaveEliminacion
                partidos={torneo.partidos}
                faseActual=""
                onActualizarResultado={(id, gl, gv) => registrarResultado(id, gl, gv)}
                onIniciarPartido={iniciarPartidoUI}
                onTerminarPartido={terminarPartidoUI}
              />
            ) : (
              torneo.partidos.map(partido => (
                <div key={partido.id} className="match-card">
                  <div className="match-teams">
                    <div className="match-team">
                      <span className="match-team-color" style={{ background: partido.colorLocal }} />
                      <span>{partido.nombreLocal}</span>
                    </div>
                    <div className="match-score" style={{ cursor: 'pointer' }} onClick={() => {
                      const gl = prompt(`Goles ${partido.nombreLocal}:`, String(partido.golesLocal));
                      const gv = prompt(`Goles ${partido.nombreVisitante}:`, String(partido.golesVisitante));
                      if (gl !== null && gv !== null) {
                        registrarResultado(partido.id, parseInt(gl) || 0, parseInt(gv) || 0);
                      }
                    }}>
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
                    <input
                      type="time"
                      value={partido.hora || ''}
                      onChange={(e) => {
                        const actualizado = torneo.partidos.map(p =>
                          p.id === partido.id ? { ...p, hora: e.target.value } : p
                        );
                        guardar({ ...torneo, partidos: actualizado });
                      }}
                      style={{ background: 'transparent', border: '1px solid #00b4d8', color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 12 }}
                    />
                    <select
                      value={partido.estado}
                      onChange={(e) => {
                        const actualizado = torneo.partidos.map(p =>
                          p.id === partido.id ? { ...p, estado: e.target.value as any } : p
                        );
                        guardar({ ...torneo, partidos: actualizado });
                      }}
                      style={{ background: 'transparent', border: '1px solid #00b4d8', color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 12 }}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_vivo">En Vivo</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'tabla' && (
          <div>
            <h2 className="mb-3">Tabla de Posiciones</h2>
            {equiposOrdenados.length === 0 ? (
              <div className="empty-state">
                <p>Agrega equipos para ver la tabla</p>
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
      </div>

      {showModalEquipo && (
        <ModalAgregarEquipo onClose={() => setShowModalEquipo(false)} onAdd={agregarEquipo} />
      )}
    </div>
  );
}

function ModalAgregarEquipo({ onClose, onAdd }: { onClose: () => void; onAdd: (nombre: string, color: string) => void }) {
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const colores = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">➕ Agregar Equipo</h2>

        <form onSubmit={e => { e.preventDefault(); onAdd(nombre, color); }}>
          <div className="form-group">
            <label>Nombre del Equipo</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Los Cracks" required />
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
              {colores.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 40, height: 40, background: c, border: color === c ? '3px solid white' : 'none',
                    borderRadius: 8, cursor: 'pointer'
                  }}
                />
              ))}
            </div>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ marginTop: 8 }} />
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
            💾 Guardar
          </button>
        </form>
      </div>
    </div>
  );
}
