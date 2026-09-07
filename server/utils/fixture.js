const { v4: uuidv4 } = require('uuid');

function generarPublicId() {
  return uuidv4().split('-').slice(0, 2).join('');
}

function generarLiga(equipos) {
  if (equipos.length < 2) return [];
  
  const n = equipos.length;
  const jornadas = n % 2 === 0 ? n - 1 : n;
  const partidosPorJornada = Math.floor(n / 2);
  
  let arr = [...equipos];
  if (n % 2 !== 0) arr.push(null);
  
  const fixture = [];
  const numJornadas = arr.length - 1;
  
  for (let j = 0; j < numJornadas; j++) {
    const jornada = [];
    for (let i = 0; i < arr.length / 2; i++) {
      const local = arr[i];
      const visitante = arr[arr.length - 1 - i];
      if (local && visitante) {
        jornada.push({ local, visitante });
      }
    }
    fixture.push({ jornada: j + 1, partidos: jornada });
    
    const fijo = arr[0];
    const rotar = arr.slice(1);
    rotar.unshift(rotar.pop());
    arr = [fijo, ...rotar];
  }
  
  return fixture;
}

function generarEliminacion(equipos) {
  if (equipos.length < 2) return [];
  
  const n = equipos.length;
  let potencia = 2;
  while (potencia < n) potencia *= 2;
  
  const numByes = potencia - n;
  const shuffled = [...equipos].sort(() => Math.random() - 0.5);
  const partidos = [];
  
  const totalPartidos = potencia / 2;
  for (let i = 0; i < totalPartidos; i++) {
    const local = shuffled[i] || null;
    const visitante = shuffled[totalPartidos * 2 - 1 - i] || null;
    if (local && visitante) {
      partidos.push({ local, visitante });
    }
  }
  
  return [{
    fase: `Octavos de Final`,
    partidos: partidos
  }];
}

function generarGrupos(equipos, numGrupos) {
  if (equipos.length < 2 || numGrupos < 1) return [];
  
  const shuffled = [...equipos].sort(() => Math.random() - 0.5);
  const grupos = {};
  
  for (let i = 0; i < numGrupos; i++) {
    grupos[String.fromCharCode(65 + i)] = [];
  }
  
  shuffled.forEach((equipo, idx) => {
    const grupoLetra = String.fromCharCode(65 + (idx % numGrupos));
    grupos[grupoLetra].push(equipo);
  });
  
  const fixture = [];
  Object.keys(grupos).forEach(letra => {
    const equiposGrupo = grupos[letra];
    const partidosGrupo = generarLiga(equiposGrupo);
    partidosGrupo.forEach(j => {
      fixture.push({
        grupo: letra,
        jornada: j.jornada,
        partidos: j.partidos
      });
    });
  });
  
  return fixture;
}

module.exports = {
  generarPublicId,
  generarLiga,
  generarEliminacion,
  generarGrupos
};
