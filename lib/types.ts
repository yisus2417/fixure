export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  createdAt: number;
}

export interface Equipo {
  id: string;
  nombre: string;
  color: string;
  grupo?: string;
  estadisticas: EstadisticasEquipo;
}

export interface EstadisticasEquipo {
  jugados: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  golesFavor: number;
  golesContra: number;
  puntos: number;
}

export interface Partido {
  id: string;
  numeroPartido: number;
  jornada: number;
  fase: string;
  grupo?: string;
  local: string;
  visitante: string;
  nombreLocal: string;
  nombreVisitante: string;
  colorLocal: string;
  colorVisitante: string;
  golesLocal: number;
  golesVisitante: number;
  estado: 'pendiente' | 'en_vivo' | 'finalizado';
  tiempo: 'pendiente' | 'primer_tiempo' | 'entre_tiempo' | 'segundo_tiempo' | 'finalizado';
  fecha?: string;
  hora?: string;
  horaInicio?: string;
  horaFin?: string;
  minutoActual?: number;
  segundoActual?: number;
  cancha?: number;
  incidencias: Incidencia[];
  ronda: number;
  siguientePartidoId?: string;
  posicionEnSiguiente?: 'local' | 'visitante';
}

export interface Incidencia {
  id: string;
  tipo: 'gol' | 'amarilla' | 'roja';
  jugador: string;
  minuto: number;
  equipo: 'local' | 'visitante';
}

export interface Torneo {
  id: string;
  nombre: string;
  formato: 'liga' | 'eliminacion' | 'grupos';
  modalidad: string;
  numGrupos: number;
  creadorId: string;
  creadorNombre: string;
  equipos: Equipo[];
  partidos: Partido[];
  estado: 'activo' | 'proximo' | 'finalizado';
  creadoEn: number;
  comparteHash: string;
}

export type FormatoTorneo = 'liga' | 'eliminacion' | 'grupos';
export type ModalidadFutsal = 'futsal5' | 'futsal' | 'futbol5' | 'futbol7';
export type EstadoPartido = 'pendiente' | 'en_vivo' | 'finalizado';
