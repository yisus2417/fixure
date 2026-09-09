'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Usuario, Torneo, Equipo, Partido } from '@/lib/types';
import { generarLigaRoundRobin, generarEliminacion, generarGrupos, calcularEstadisticas, ordenarEquipos } from '@/lib/fixture';

function generarId(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

export default function Dashboard() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('futsal_current_user');
    if (!stored) {
      router.push('/login');
      return;
    }
    setUsuario(JSON.parse(stored));

    const storedTorneos = localStorage.getItem(`futsal_torneos_${JSON.parse(stored).id}`);
    setTorneos(storedTorneos ? JSON.parse(storedTorneos) : []);
  }, [router]);

  const guardarTorneos = useCallback((nuevos: Torneo[]) => {
    if (!usuario) return;
    localStorage.setItem(`futsal_torneos_${usuario.id}`, JSON.stringify(nuevos));
    setTorneos(nuevos);
  }, [usuario]);

  const crearTorneo = (nombre: string, formato: 'liga' | 'eliminacion' | 'grupos', modalidad: string, numGrupos: number) => {
    if (!usuario) return;

    const nuevoTorneo: Torneo = {
      id: generarId(),
      nombre,
      formato,
      modalidad,
      numGrupos,
      creadorId: usuario.id,
      creadorNombre: usuario.nombre,
      equipos: [],
      partidos: [],
      estado: 'proximo',
      creadoEn: Date.now(),
      comparteHash: generarId().split('-')[0] + generarId().split('-')[0]
    };

    guardarTorneos([...torneos, nuevoTorneo]);
    setShowModal(false);

    // Save to KV (Upstash) if configured
    fetch('/api/torneo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoTorneo),
    }).catch((e) => {
      console.log('KV no disponible, solo localStorage');
    });
  };

  const eliminarTorneo = async (id: string) => {
    if (!confirm('¿Eliminar este torneo?')) return;
    const torneoAEliminar = torneos.find(t => t.id === id);
    if (torneoAEliminar) {
      try {
        await fetch(`/api/torneo/${torneoAEliminar.comparteHash}`, {
          method: 'DELETE',
        });
      } catch (e) {
        console.log('KV no disponible para eliminar');
      }
    }
    guardarTorneos(torneos.filter(t => t.id !== id));
  };

  const logout = () => {
    localStorage.removeItem('futsal_current_user');
    router.push('/');
  };

  if (!usuario) return null;

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Hola, {usuario.nombre} 👋</h1>
            <p className="text-muted">Gestiona tus fixtures de futsal</p>
          </div>
          <div className="flex gap-2 items-center">
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              ➕ Nuevo Fixture
            </button>
            <button onClick={logout} className="btn btn-secondary" style={{ color: 'var(--led-red)' }}>
              Salir
            </button>
          </div>
        </div>

        {torneos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚡</div>
            <h3>No tienes fixtures aún</h3>
            <p>Crea tu primer fixture de futsal</p>
            <button className="btn btn-primary mt-3" onClick={() => setShowModal(true)}>
              ➕ Crear Fixture
            </button>
          </div>
        ) : (
          <div className="torneos-grid">
            {torneos.map(torneo => (
              <div key={torneo.id} className="torneo-card">
                <h3>{torneo.nombre}</h3>
                <div className="card-info">
                  <span>📅 {torneo.formato}</span>
                  <span>⚽ {torneo.modalidad}</span>
                  <span>{torneo.equipos.length} equipos</span>
                </div>
                <div className="flex gap-1" style={{ marginBottom: '0.5rem' }}>
                  <span className="match-badge pendiente">{torneo.estado}</span>
                </div>
                <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                  <Link href={`/torneo/${torneo.id}`} className="btn btn-primary btn-small" style={{ flex: 1, justifyContent: 'center' }}>
                    Gestionar
                  </Link>
                  <Link href={`/publico/${torneo.comparteHash}`} className="btn btn-secondary btn-small" target="_blank">
                    🔗 Ver
                  </Link>
                  <button onClick={() => eliminarTorneo(torneo.id)} className="btn btn-danger btn-small">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ModalCrearTorneo
          onClose={() => setShowModal(false)}
          onCreate={crearTorneo}
        />
      )}
    </div>
  );
}

function ModalCrearTorneo({ onClose, onCreate }: { onClose: () => void; onCreate: (nombre: string, formato: 'liga' | 'eliminacion' | 'grupos', modalidad: string, numGrupos: number) => void }) {
  const [nombre, setNombre] = useState('');
  const [formato, setFormato] = useState<'liga' | 'eliminacion' | 'grupos'>('liga');
  const [modalidad, setModalidad] = useState('futsal5');
  const [numGrupos, setNumGrupos] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onCreate(nombre, formato, modalidad, numGrupos);
  };

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">⚡ Crear Nuevo Fixture</h2>
        <p className="modal-subtitle">Configura tu torneo de futsal</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del Fixture</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Copa Futsal 2024"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Formato</label>
              <select value={formato} onChange={e => setFormato(e.target.value as any)}>
                <option value="liga">Liga (todos contra todos)</option>
                <option value="eliminacion">Eliminación Directa</option>
                <option value="grupos">Fase de Grupos</option>
              </select>
            </div>

            <div className="form-group">
              <label>Modalidad</label>
              <select value={modalidad} onChange={e => setModalidad(e.target.value)}>
                <option value="futsal5">Futsal 5</option>
                <option value="futsal">Futsal (estándar)</option>
                <option value="futbol5">Fútbol 5</option>
                <option value="futbol7">Fútbol 7</option>
              </select>
            </div>
          </div>

          {formato === 'grupos' && (
            <div className="form-group">
              <label>Número de Grupos</label>
              <input
                type="number"
                value={numGrupos}
                onChange={e => setNumGrupos(parseInt(e.target.value))}
                min={2}
                max={8}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: '1rem' }}>
            ⚡ Crear Fixture
          </button>
        </form>
      </div>
    </div>
  );
}
