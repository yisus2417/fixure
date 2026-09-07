import { Equipo, Partido } from './types';

function generarId(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Genera fixture round-robin (liga) para un número par/impar de equipos
 */
export function generarLigaRoundRobin(equipos: Equipo[]): Partido[] {
  const n = equipos.length;
  if (n < 2) return [];

  // Añadir null si es impar para crearBye
  const arr = [...equipos];
  if (n % 2 !== 0) arr.push({ id: 'BYE', nombre: 'BYE', color: '#666', estadisticas: { jugados: 0, ganados: 0, empatados: 0, perdidos: 0, golesFavor: 0, golesContra: 0, puntos: 0 } });

  const numJornadas = arr.length - 1;
  const partidosPorJornada = Math.floor(arr.length / 2);
  const fixture: Partido[] = [];

  for (let j = 0; j < numJornadas; j++) {
    for (let i = 0; i < arr.length / 2; i++) {
      const local = arr[i];
      const visitante = arr[arr.length - 1 - i];

      if (local.id !== 'BYE' && visitante.id !== 'BYE') {
        fixture.push({
          id: generarId(),
          jornada: j + 1,
          fase: 'Liga Regular',
          local: local.id,
          visitante: visitante.id,
          nombreLocal: local.nombre,
          nombreVisitante: visitante.nombre,
          colorLocal: local.color,
          colorVisitante: visitante.color,
          golesLocal: 0,
          golesVisitante: 0,
          estado: 'pendiente',
          tiempo: 'pendiente',
          hora: '',
          horaInicio: '',
          horaFin: '',
          minutoActual: 0,
          segundoActual: 0,
          incidencias: [],
          ronda: 1
        });
      }
    }

    // Rotar equipos (el primero se queda fijo, el resto rota)
    const fijo = arr[0];
    const rotar = arr.slice(1);
    rotar.unshift(rotar.pop()!);
    arr.splice(1, rotar.length, ...rotar);
  }

  return fixture;
}

/**
 * Genera fixture completo de eliminación directa con todas las llaves
 * Maneja correctamente equipos impares con BYEs
 */
export function generarEliminacion(equipos: Equipo[]): Partido[] {
  if (equipos.length < 2) return [];

  const numEquipos = equipos.length;
  const barajados = [...equipos].sort(() => Math.random() - 0.5);

  // Calcular número de rondas necesarias
  let numRondas = 1;
  let capacidad = 2;
  while (capacidad < numEquipos) {
    capacidad *= 2;
    numRondas++;
  }

  // Nombres de rondas de primera a última
  const nombresRondas = ['Final'];
  if (numRondas >= 2) nombresRondas.unshift('Semifinal');
  if (numRondas >= 3) nombresRondas.unshift('Cuartos');
  if (numRondas >= 4) nombresRondas.unshift('Octavos');
  if (numRondas >= 5) nombresRondas.unshift('Dieciseisavos');
  if (numRondas >= 6) nombresRondas.unshift('Treintaidosavos');

  const fixture: Partido[] = [];
  const partidosPorRonda: Partido[][] = [];

  // Ronda 1: emparejar tantos como sea posible, 1 BYE si es impar
  const ronda1: Partido[] = [];
  let equiposRestantes = [...barajados];
  let numPartidosRonda1 = Math.floor(equiposRestantes.length / 2);
  let tieneBye = equiposRestantes.length % 2 === 1;
  let equipoBye: Equipo | null = tieneBye ? equiposRestantes[equiposRestantes.length - 1] : null;
  if (equipoBye) equiposRestantes = equiposRestantes.slice(0, -1);

  for (let i = 0; i < numPartidosRonda1; i++) {
    const local = equiposRestantes[i * 2];
    const visitante = equiposRestantes[i * 2 + 1];
    ronda1.push({
      id: generarId(),
      jornada: 1,
      fase: nombresRondas[0],
      local: local.id,
      visitante: visitante.id,
      nombreLocal: local.nombre,
      nombreVisitante: visitante.nombre,
      colorLocal: local.color,
      colorVisitante: visitante.color,
      golesLocal: 0,
      golesVisitante: 0,
      estado: 'pendiente',
      tiempo: 'pendiente',
      hora: '',
      horaInicio: '',
      horaFin: '',
      minutoActual: 0,
      segundoActual: 0,
      incidencias: [],
      ronda: 1
    });
  }

  // Agregar partido BYE si hay
  if (equipoBye) {
    ronda1.push({
      id: generarId(),
      jornada: 1,
      fase: nombresRondas[0],
      local: equipoBye.id,
      visitante: '',
      nombreLocal: equipoBye.nombre,
      nombreVisitante: 'BYE',
      colorLocal: equipoBye.color,
      colorVisitante: '#666',
      golesLocal: 0,
      golesVisitante: 0,
      estado: 'finalizado',
      tiempo: 'finalizado',
      hora: '',
      horaInicio: '',
      horaFin: '',
      minutoActual: 0,
      segundoActual: 0,
      incidencias: [],
      ronda: 1
    });
  }

  fixture.push(...ronda1);
  partidosPorRonda.push(ronda1);

  // Rondas siguientes
  for (let ronda = 2; ronda <= numRondas; ronda++) {
    const rondaAnterior = partidosPorRonda[ronda - 2];
    const numPartidos = Math.ceil(rondaAnterior.length / 2);
    const rondaActual: Partido[] = [];
    const nombreFase = nombresRondas[ronda - 1]; // ronda 2 = nombresRondas[1] = Cuartos, etc.

    let idxAnterior = 0;
    for (let i = 0; i < numPartidos; i++) {
      const partido1 = rondaAnterior[idxAnterior];
      const partido2 = rondaAnterior[idxAnterior + 1];

      let localNombre = 'TBD', localId = '', localColor = '#666';
      let visitanteNombre = 'TBD', visitanteId = '', visitanteColor = '#666';

      if (partido1 && partido1.estado === 'finalizado') {
        const esLocal1Ganador = partido1.golesLocal > partido1.golesVisitante || partido1.nombreVisitante === 'BYE';
        if (esLocal1Ganador) {
          localId = partido1.local;
          localNombre = partido1.nombreLocal;
          localColor = partido1.colorLocal;
        } else {
          localId = partido1.visitante;
          localNombre = partido1.nombreVisitante;
          localColor = partido1.colorVisitante;
        }
      }

      if (partido2 && partido2.estado === 'finalizado' && partido2.nombreVisitante !== 'BYE') {
        const esLocal2Ganador = partido2.golesLocal > partido2.golesVisitante;
        if (esLocal2Ganador) {
          visitanteId = partido2.local;
          visitanteNombre = partido2.nombreLocal;
          visitanteColor = partido2.colorLocal;
        } else {
          visitanteId = partido2.visitante;
          visitanteNombre = partido2.nombreVisitante;
          visitanteColor = partido2.colorVisitante;
        }
      } else if (!partido2) {
        // Solo hay un equipo, avanza directo
        localId = localId;
        visitanteId = '';
        visitanteNombre = 'TBD';
      }

      const partido: Partido = {
        id: generarId(),
        jornada: ronda,
        fase: nombreFase,
        local: localId,
        visitante: visitanteId,
        nombreLocal: localNombre,
        nombreVisitante: visitanteNombre,
        colorLocal: localColor,
        colorVisitante: visitanteColor,
        golesLocal: 0,
        golesVisitante: 0,
        estado: 'pendiente',
        tiempo: 'pendiente',
        hora: '',
        horaInicio: '',
        horaFin: '',
        minutoActual: 0,
        segundoActual: 0,
        incidencias: [],
        ronda
      };

      // Enlazar con partidos anteriores
      if (partido1) {
        partido1.siguientePartidoId = partido.id;
        partido1.posicionEnSiguiente = 'local';
      }
      if (partido2) {
        partido2.siguientePartidoId = partido.id;
        partido2.posicionEnSiguiente = 'visitante';
      }

      rondaActual.push(partido);
      fixture.push(partido);
      idxAnterior += 2;
    }

    partidosPorRonda.push(rondaActual);
  }

  return fixture;
}

/**
 * Genera fixture por grupos
 */
export function generarGrupos(equipos: Equipo[], numGrupos: number): Partido[] {
  if (equipos.length < 2 || numGrupos < 1) return [];

  // Distribuir equipos en grupos
  const grupos: { [key: string]: Equipo[] } = {};
  for (let i = 0; i < numGrupos; i++) {
    grupos[String.fromCharCode(65 + i)] = [];
  }

  equipos.forEach((eq, idx) => {
    const grupoIdx = idx % numGrupos;
    grupos[String.fromCharCode(65 + grupoIdx)].push(eq);
  });

  const fixture: Partido[] = [];
  let jornadaGlobal = 1;

  Object.keys(grupos).forEach(grupo => {
    const eqsGrupo = grupos[grupo];
    if (eqsGrupo.length < 2) return;

    const partidosGrupo = generarLigaRoundRobin(eqsGrupo);
    partidosGrupo.forEach(p => {
      fixture.push({
        ...p,
        jornada: jornadaGlobal,
        grupo,
        fase: `Grupo ${grupo}`
      });
      jornadaGlobal++;
    });
  });

  return fixture;
}

/**
 * Genera hash de compartir único
 */
export function generarShareHash(): string {
  return generarId().split('-')[0] + generarId().split('-')[0];
}

/**
 * Codifica datos a base64 para URL
 */
export function encodeData<T>(data: T): string {
  return btoa(encodeURIComponent(JSON.stringify(data)));
}

/**
 * Decodifica datos de base64
 */
export function decodeData<T>(encoded: string): T | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch {
    return null;
  }
}

/**
 * Calcula estadísticas de equipo basadas en partidos
 */
export function calcularEstadisticas(equipos: Equipo[], partidos: Partido[]): Equipo[] {
  return equipos.map(eq => {
    let jugados = 0, ganados = 0, empatados = 0, perdidos = 0;
    let gf = 0, gc = 0;

    partidos.forEach(p => {
      if (p.estado === 'pendiente') return;

      let esLocal = p.local === eq.id;
      let esVisitante = p.visitante === eq.id;
      let misGoles = esLocal ? p.golesLocal : esVisitante ? p.golesVisitante : 0;
      let rivalGoles = esLocal ? p.golesVisitante : esVisitante ? p.golesLocal : 0;

      if (esLocal || esVisitante) {
        jugados++;
        gf += misGoles;
        gc += rivalGoles;

        if (misGoles > rivalGoles) ganados++;
        else if (misGoles < rivalGoles) perdidos++;
        else empatados++;
      }
    });

    return {
      ...eq,
      estadisticas: {
        jugados,
        ganados,
        empatados,
        perdidos,
        golesFavor: gf,
        golesContra: gc,
        puntos: ganados * 3 + empatados * 1
      }
    };
  });
}

/**
 * Ordena equipos por posición
 */
export function ordenarEquipos(equipos: Equipo[]): Equipo[] {
  return [...equipos].sort((a, b) => {
    if (b.estadisticas.puntos !== a.estadisticas.puntos) {
      return b.estadisticas.puntos - a.estadisticas.puntos;
    }
    const difA = a.estadisticas.golesFavor - a.estadisticas.golesContra;
    const difB = b.estadisticas.golesFavor - b.estadisticas.golesContra;
    if (difB !== difA) return difB - difA;
    return b.estadisticas.golesFavor - a.estadisticas.golesFavor;
  });
}

/**
 * Avanza al ganador de un partido a la siguiente ronda
 */
export function avanzarGanador(partidos: Partido[], partidoId: string): Partido[] {
  const partidoActualizado = partidos.find(p => p.id === partidoId);
  if (!partidoActualizado || partidoActualizado.estado !== 'finalizado') {
    return partidos;
  }

  const ganadorEsLocal = partidoActualizado.golesLocal > partidoActualizado.golesVisitante;
  const equipoGanador = {
    id: ganadorEsLocal ? partidoActualizado.local : partidoActualizado.visitante,
    nombre: ganadorEsLocal ? partidoActualizado.nombreLocal : partidoActualizado.nombreVisitante,
    color: ganadorEsLocal ? partidoActualizado.colorLocal : partidoActualizado.colorVisitante
  };

  return partidos.map(p => {
    if (p.id === partidoActualizado.siguientePartidoId) {
      if (partidoActualizado.posicionEnSiguiente === 'local') {
        return { ...p, local: equipoGanador.id, nombreLocal: equipoGanador.nombre, colorLocal: equipoGanador.color };
      } else {
        return { ...p, visitante: equipoGanador.id, nombreVisitante: equipoGanador.nombre, colorVisitante: equipoGanador.color };
      }
    }
    return p;
  });
}

/**
 * Inicia primer tiempo de un partido
 */
export function iniciarPartido(partidos: Partido[], partidoId: string): Partido[] {
  const ahora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return partidos.map(p => {
    if (p.id === partidoId && p.estado === 'pendiente') {
      return { ...p, estado: 'en_vivo' as const, tiempo: 'primer_tiempo' as const, horaInicio: ahora, minutoActual: 0, segundoActual: 0 };
    }
    return p;
  });
}

/**
 * Pasa a entretiempo
 */
export function pasarEntreTiempo(partidos: Partido[], partidoId: string): Partido[] {
  return partidos.map(p => {
    if (p.id === partidoId && p.estado === 'en_vivo' && p.tiempo === 'primer_tiempo') {
      return { ...p, tiempo: 'entre_tiempo' as const };
    }
    return p;
  });
}

/**
 * Inicia segundo tiempo
 */
export function iniciarSegundoTiempo(partidos: Partido[], partidoId: string): Partido[] {
  return partidos.map(p => {
    if (p.id === partidoId && p.estado === 'en_vivo' && p.tiempo === 'entre_tiempo') {
      return { ...p, tiempo: 'segundo_tiempo' as const };
    }
    return p;
  });
}

/**
 * Termina un partido
 */
export function terminarPartido(partidos: Partido[], partidoId: string): Partido[] {
  const ahora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return partidos.map(p => {
    if (p.id === partidoId && p.estado === 'en_vivo') {
      return { ...p, estado: 'finalizado' as const, tiempo: 'finalizado' as const, horaFin: ahora };
    }
    return p;
  });
}

/**
 * Actualiza el marcador de un partido
 */
export function actualizarMarcador(partidos: Partido[], partidoId: string, golesLocal: number, golesVisitante: number): Partido[] {
  return partidos.map(p => {
    if (p.id === partidoId && p.estado === 'en_vivo') {
      return { ...p, golesLocal, golesVisitante };
    }
    return p;
  });
}

/**
 * Actualiza minuto y segundo de un partido en vivo
 */
export function actualizarTiempo(partidos: Partido[], partidoId: string, minuto: number, segundo: number): Partido[] {
  return partidos.map(p => {
    if (p.id === partidoId && p.estado === 'en_vivo') {
      return { ...p, minutoActual: minuto, segundoActual: segundo };
    }
    return p;
  });
}
