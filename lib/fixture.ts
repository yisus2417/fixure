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
          incidencias: []
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
 * Genera fixture de eliminación directa
 */
export function generarEliminacion(equipos: Equipo[]): Partido[] {
  if (equipos.length < 2) return [];

  const n = equipos.length;
  let potencia = 2;
  while (potencia < n) potencia *= 2;

  const fixture: Partido[] = [];
  const numByes = potencia - n;
  
  // Barajar equipos
  const shuffled = [...equipos].sort(() => Math.random() - 0.5);
  
  // Calcular cuántas rondas hay
  const rondas = Math.log2(potencia);
  
  let roundName = 'Final';
  if (rondas === 2) roundName = 'Semifinal';
  else if (rondas === 3) roundName = 'Cuartos';
  else if (rondas === 4) roundName = 'Octavos';
  else if (rondas >= 5) roundName = `${potencia / 2}avos`;

  const numPartidosRonda1 = potencia / 2;
  for (let i = 0; i < numPartidosRonda1; i++) {
    const local = shuffled[i] || null;
    const visitante = shuffled[potencia - 1 - i] || null;

    if (local && visitante) {
      fixture.push({
        id: generarId(),
        jornada: 1,
        fase: roundName,
        local: local.id,
        visitante: visitante.id,
        nombreLocal: local.nombre,
        nombreVisitante: visitante.nombre,
        colorLocal: local.color,
        colorVisitante: visitante.color,
        golesLocal: 0,
        golesVisitante: 0,
        estado: 'pendiente',
        incidencias: []
      });
    } else if (local && !visitante) {
      // Bye - avanza directo
      fixture.push({
        id: generarId(),
        jornada: 1,
        fase: roundName,
        local: local.id,
        visitante: 'BYE',
        nombreLocal: local.nombre,
        nombreVisitante: 'BYE',
        colorLocal: local.color,
        colorVisitante: '#666',
        golesLocal: 0,
        golesVisitante: 0,
        estado: 'finalizado',
        incidencias: []
      });
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
