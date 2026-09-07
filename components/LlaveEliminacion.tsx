'use client';

import { Partido } from '@/lib/types';

interface LlaveProps {
  partidos: Partido[];
  faseActual: string;
  onActualizarMarcador?: (partidoId: string, gl: number, gv: number) => void;
  onIniciarPartido?: (partidoId: string) => void;
  onPasarEntreTiempo?: (partidoId: string) => void;
  onIniciarSegundoTiempo?: (partidoId: string) => void;
  onTerminarPartido?: (partidoId: string) => void;
  soloLectura?: boolean;
}

export default function LlaveEliminacion({ partidos, faseActual, soloLectura, onActualizarMarcador, onIniciarPartido, onPasarEntreTiempo, onIniciarSegundoTiempo, onTerminarPartido }: LlaveProps) {
  const fasesOrdenadas = ['Final', 'Semifinal', 'Cuartos', 'Octavos', 'Dieciseisavos', 'Treintaidosavos'];

  const getFaseOrden = (fase: string): number => {
    if (fase.includes('32') || fase.includes('Treintaidos')) return 5;
    if (fase.includes('16') || fase.includes('Dieciseis')) return 4;
    if (fase.includes('8') || fase.includes('Octavos')) return 3;
    if (fase.includes('4') || fase.includes('Cuartos')) return 2;
    if (fase.includes('Semifinal')) return 1;
    if (fase.includes('Final')) return 0;
    return 99;
  };

  const fasesPresentes = Array.from(new Set(partidos.map(p => p.fase))).sort((a, b) => getFaseOrden(b) - getFaseOrden(a));

  const getPartidosFase = (fase: string) => partidos.filter(p => p.fase === fase);

  const getTiempoLabel = (tiempo: string) => {
    switch (tiempo) {
      case 'primer_tiempo': return '1T';
      case 'entre_tiempo': return 'ET';
      case 'segundo_tiempo': return '2T';
      case 'finalizado': return 'FT';
      default: return '';
    }
  };

  const getMinutoMostrar = (partido: Partido) => {
    if (partido.estado === 'pendiente') return null;
    if (partido.estado === 'finalizado') return 'FT';
    if (partido.minutoActual !== undefined && partido.segundoActual !== undefined) {
      return `${partido.minutoActual}:${partido.segundoActual.toString().padStart(2, '0')}`;
    }
    return null;
  };

  const editarMarcador = (partido: Partido) => {
    if (soloLectura || !onActualizarMarcador) return;
    const gl = prompt(`Goles ${partido.nombreLocal}:`, String(partido.golesLocal));
    const gv = prompt(`Goles ${partido.nombreVisitante}:`, String(partido.golesVisitante));
    if (gl !== null && gv !== null) {
      onActualizarMarcador(partido.id, parseInt(gl) || 0, parseInt(gv) || 0);
    }
  };

  const renderPartido = (partido: Partido) => (
    <div
      key={partido.id}
      className={`bracket-match ${partido.estado === 'en_vivo' ? 'en-vivo' : ''} ${partido.estado === 'finalizado' ? 'finalizado' : ''}`}
    >
      {!soloLectura && (
        <div className="bracket-controls">
          {partido.estado === 'pendiente' && onIniciarPartido && (
            <button className="bracket-btn start" onClick={() => onIniciarPartido(partido.id)}>
              ▶ 1T
            </button>
          )}
          {partido.estado === 'en_vivo' && partido.tiempo === 'primer_tiempo' && onPasarEntreTiempo && (
            <button className="bracket-btn halftime" onClick={() => onPasarEntreTiempo(partido.id)}>
              ⏸ ET
            </button>
          )}
          {partido.estado === 'en_vivo' && partido.tiempo === 'entre_tiempo' && onIniciarSegundoTiempo && (
            <button className="bracket-btn start" onClick={() => onIniciarSegundoTiempo(partido.id)}>
              ▶ 2T
            </button>
          )}
          {partido.estado === 'en_vivo' && onTerminarPartido && (
            <button className="bracket-btn end" onClick={() => onTerminarPartido(partido.id)}>
              ■ Fin
            </button>
          )}
        </div>
      )}
      <div className="bracket-team" onClick={() => partido.estado === 'en_vivo' && editarMarcador(partido)} style={{ cursor: partido.estado === 'en_vivo' && !soloLectura ? 'pointer' : 'default' }}>
        <span className="bracket-color" style={{ background: partido.colorLocal }} />
        <span className={`bracket-name ${partido.golesLocal > partido.golesVisitante ? 'ganador' : ''}`}>
          {partido.nombreLocal}
        </span>
        <span className="bracket-goles">{partido.golesLocal}</span>
      </div>
      <div className="bracket-team" onClick={() => partido.estado === 'en_vivo' && editarMarcador(partido)} style={{ cursor: partido.estado === 'en_vivo' && !soloLectura ? 'pointer' : 'default' }}>
        <span className="bracket-color" style={{ background: partido.colorVisitante }} />
        <span className={`bracket-name ${partido.golesVisitante > partido.golesLocal ? 'ganador' : ''}`}>
          {partido.nombreVisitante}
        </span>
        <span className="bracket-goles">{partido.golesVisitante}</span>
      </div>
      <div className="bracket-info">
        {partido.estado === 'en_vivo' && (
          <div className="bracket-tiempo-live">
            <span className="bracket-badge-tiempo">{getTiempoLabel(partido.tiempo || '')}</span>
            <span className="bracket-minuto">
              {getMinutoMostrar(partido)}'
            </span>
          </div>
        )}
        {partido.estado === 'finalizado' && (
          <span className="bracket-tiempo finalizado">
            ✓ Final · {partido.horaInicio || ''} - {partido.horaFin || ''}
          </span>
        )}
        {partido.estado === 'pendiente' && partido.hora && (
          <span className="bracket-tiempo">⏰ {partido.hora}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="bracket-container">
      <style>{`
        .bracket-container {
          display: flex;
          justify-content: center;
          align-items: stretch;
          gap: 30px;
          padding: 20px;
          overflow-x: auto;
          min-height: 300px;
        }
        .bracket-round {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 200px;
        }
        .bracket-round-title {
          color: #00f5a0;
          font-weight: bold;
          margin-bottom: 8px;
          text-align: center;
          font-size: 14px;
        }
        .bracket-matches {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          flex: 1;
          gap: 12px;
        }
        .bracket-match {
          background: rgba(0, 180, 216, 0.1);
          border: 1px solid #00b4d8;
          border-radius: 8px;
          padding: 10px 14px;
          min-width: 180px;
          transition: all 0.2s;
        }
        .bracket-match.en-vivo {
          border-color: #00f5a0;
          box-shadow: 0 0 10px rgba(0, 245, 160, 0.3);
        }
        .bracket-match.finalizado {
          opacity: 0.85;
        }
        .bracket-team {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
        }
        .bracket-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .bracket-name {
          flex: 1;
          font-size: 13px;
          color: #fff;
        }
        .bracket-name.ganador {
          color: #00f5a0;
          font-weight: bold;
        }
        .bracket-goles {
          font-weight: bold;
          font-size: 14px;
          color: #00b4d8;
          min-width: 20px;
          text-align: center;
        }
        .bracket-hora {
          font-size: 10px;
          color: #888;
          text-align: center;
          margin-top: 4px;
        }
        .bracket-controls {
          display: flex;
          gap: 4px;
          margin-bottom: 8px;
        }
        .bracket-btn {
          flex: 1;
          padding: 3px 6px;
          font-size: 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        .bracket-btn.start {
          background: #00f5a0;
          color: #000;
        }
        .bracket-btn.end {
          background: #ff4757;
          color: #fff;
        }
        .bracket-btn.halftime {
          background: #ffa502;
          color: #000;
        }
        .bracket-info {
          text-align: center;
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px solid rgba(0, 180, 216, 0.2);
        }
        .bracket-tiempo {
          font-size: 11px;
          color: #00f5a0;
          font-weight: bold;
        }
        .bracket-tiempo.finalizado {
          color: #888;
        }
        .bracket-tiempo-live {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .bracket-badge-tiempo {
          background: #00f5a0;
          color: #000;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: bold;
        }
        .bracket-minuto {
          font-size: 16px;
          font-weight: bold;
          color: #fff;
        }
      `}</style>
      {fasesPresentes.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>
          No hay partidos generados
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 30 }}>
          {fasesPresentes.map(fase => (
            <div key={fase} className="bracket-round">
              <div className="bracket-round-title">{fase}</div>
              <div className="bracket-matches">
                {getPartidosFase(fase).map(partido => renderPartido(partido))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
