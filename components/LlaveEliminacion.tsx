'use client';

import { Partido } from '@/lib/types';

interface LlaveProps {
  partidos: Partido[];
  faseActual: string;
  onActualizarResultado?: (partidoId: string, gl: number, gv: number) => void;
  soloLectura?: boolean;
}

export default function LlaveEliminacion({ partidos, faseActual, soloLectura, onActualizarResultado }: LlaveProps) {
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

  const fasesPresentes = Array.from(new Set(partidos.map(p => p.fase))).sort((a, b) => getFaseOrden(a) - getFaseOrden(b));

  const getPartidosFase = (fase: string) => partidos.filter(p => p.fase === fase);

  const renderPartido = (partido: Partido) => (
    <div
      key={partido.id}
      className={`bracket-match ${partido.estado === 'en_vivo' ? 'en-vivo' : ''} ${partido.estado === 'finalizado' ? 'finalizado' : ''}`}
      onClick={() => {
        if (soloLectura || !onActualizarResultado) return;
        const gl = prompt(`Goles ${partido.nombreLocal}:`, String(partido.golesLocal));
        const gv = prompt(`Goles ${partido.nombreVisitante}:`, String(partido.golesVisitante));
        if (gl !== null && gv !== null) {
          onActualizarResultado(partido.id, parseInt(gl) || 0, parseInt(gv) || 0);
        }
      }}
      style={{ cursor: soloLectura ? 'default' : 'pointer' }}
    >
      <div className="bracket-team">
        <span className="bracket-color" style={{ background: partido.colorLocal }} />
        <span className={`bracket-name ${partido.golesLocal > partido.golesVisitante ? 'ganador' : ''}`}>
          {partido.nombreLocal}
        </span>
        <span className="bracket-goles">{partido.golesLocal}</span>
      </div>
      <div className="bracket-team">
        <span className="bracket-color" style={{ background: partido.colorVisitante }} />
        <span className={`bracket-name ${partido.golesVisitante > partido.golesLocal ? 'ganador' : ''}`}>
          {partido.nombreVisitante}
        </span>
        <span className="bracket-goles">{partido.golesVisitante}</span>
      </div>
      {partido.hora && (
        <div className="bracket-hora">{partido.hora}</div>
      )}
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
