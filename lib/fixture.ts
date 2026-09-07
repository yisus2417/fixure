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
          hora: '',
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
 */
export function generarEliminacion(equipos: Equipo[]): Partido[] {
  if (equipos.length < 2) return [];

  const n = equipos.length;
  let potencia = 2;
  while (potencia < n) potencia *= 2;

  // Crear array con BYEs para completar potencia de 2
  const equiposCompletos: (Equipo | null)[] = [...equipos];
  while (equiposCompletos.length < potencia) {
    equiposCompletos.push(null);
  }

  // Barajar solo los equipos reales (no los nulos)
  const equiposReales = equipos.filter(e => e);
  const barajados = [...equiposReales].sort(() => Math.random() - 0.5);

  // Completar con BYEs al final
  while (barajados.length < potencia) {
    barajados.push(null as any);
  }

  const fixture: Partido[] = [];
  const numRondas = Math.log2(potencia);

  // Nombres de rondas de la última a la primera
  const nombresRondas = ['Final'];
  if (numRondas >= 2) nombresRondas.unshift('Semifinal');
  if (numRondas >= 3) nombresRondas.unshift('Cuartos');
  if (numRondas >= 4) nombresRondas.unshift('Octavos');
  if (numRondas >= 5) nombresRondas.unshift('Dieciseisavos');

  // Generar todas las rondas
  let partidosRondaAnterior: Partido[] = [];

  for (let ronda = 1; ronda <= numRondas; ronda++) {
    const numPartidosRonda = potencia / Math.pow(2, ronda);
    const nombreFase = nombresRondas[numRondas - ronda];
    const partidosRonda: Partido[] = [];

    for (let i = 0; i < numPartidosRonda; i++) {
      let local: Equipo | null = null;
      let visitante: Equipo | null = null;

      if (ronda === 1) {
        // Primera ronda: usar equipos barajados
        local = barajados[i * 2];
        visitante = barajados[i * 2 + 1];
      } else {
        // Rondas siguientes: los ganadores de la ronda anterior
        const idxLocal = i * 2;
        const idxVisitante = i * 2 + 1;
        const partidoLocal = partidosRondaAnterior[idxLocal];
        const partidoVisitante = partidosRondaAnterior[idxVisitante];

        if (partidoLocal && partidoVisitante) {
          if (partidoLocal.estado === 'finalizado' && partidoVisitante.estado === 'finalizado') {
            // Ambos partidos terminados, obtener ganadores
            local = partidoLocal.golesLocal > partidoLocal.golesVisitante
              ? { id: partidoLocal.local, nombre: partidoLocal.nombreLocal, color: partidoLocal.colorLocal, estadisticas: { jugados: 0, ganados: 0, empatados: 0, perdidos: 0, golesFavor: 0, golesContra: 0, puntos: 0 } }
              : { id: partidoLocal.visitante, nombre: partidoLocal.nombreVisitante, color: partidoLocal.colorVisitante, estadisticas: { jugados: 0, ganados: 0, empatados: 0, perdidos: 0, golesFavor: 0, golesContra: 0, puntos: 0 } };
            visitante = partidoVisitante.golesLocal > partidoVisitante.golesVisitante
              ? { id: partidoVisitante.local, nombre: partidoVisitante.nombreLocal, color: partidoVisitante.colorLocal, estadisticas: { jugados: 0, ganados: 0, empatados: 0, perdidos: 0, golesFavor: 0, golesContra: 0, puntos: 0 } }
              : { id: partidoVisitante.visitante, nombre: partidoVisitante.nombreVisitante, color: partidoVisitante.colorVisitante, estadisticas: { jugados: 0, ganados: 0, empatados: 0, perdidos: 0, golesFavor: 0, golesContra: 0, puntos: 0 } };
          } else {
            // Partidos aún no terminados, dejar vacío
            local = null;
            visitante = null;
          }
        }
      }

      const partidoId = generarId();
      const esBye = !local || !visitante;

      const partido: Partido = {
        id: partidoId,
        jornada: ronda,
        fase: nombreFase,
        local: local?.id || '',
        visitante: visitante?.id || '',
        nombreLocal: local?.nombre || (esBye ? 'BYE' : 'TBD'),
        nombreVisitante: visitante?.nombre || (esBye ? 'BYE' : 'TBD'),
        colorLocal: local?.color || '#666',
        colorVisitante: visitante?.color || '#666',
        golesLocal: 0,
        golesVisitante: 0,
        estado: esBye ? 'finalizado' : 'pendiente',
        hora: '',
        incidencias: [],
        ronda
      };

      // Si no es bye y no es la última ronda, enlazar al siguiente partido
      if (!esBye && ronda < numRondas) {
        const siguienteRonda = partidosRonda.length;
        const siguientePartidoIdx = Math.floor(partidosRonda.length / 2);
        // Encontrar el partido en la siguiente ronda (aún no creado, se enlazará después)
        // Usamos el índice para encontrarlo después
        partido.siguientePartidoId = `round_${ronda + 1}_match_${siguientePartidoIdx}`;
        partido.posicionEnSiguiente = siguienteRonda % 2 === 0 ? 'local' : 'visitante';
      }

      fixture.push(partido);
      partidosRonda.push(partido);
    }

    partidosRondaAnterior = partidosRonda;
  }

  // Segunda pasada: asignar correctamente los siguientePartidoId
  for (let ronda = 1; ronda < numRondas; ronda++) {
    const partidosRonda = fixture.filter(p => p.ronda === ronda);
    const numPartidosSiguienteRonda = potencia / Math.pow(2, ronda + 1);

    for (let i = 0; i < partidosRonda.length; i++) {
      const partido = partidosRonda[i];
      const siguienteIdx = Math.floor(i / 2);
      const siguientesPartidos = fixture.filter(p => p.ronda === ronda + 1);
      if (siguientesPartidos[siguienteIdx]) {
        partido.siguientePartidoId = siguientesPartidos[siguienteIdx].id;
        partido.posicionEnSiguiente = i % 2 === 0 ? 'local' : 'visitante';
      }
    }
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
