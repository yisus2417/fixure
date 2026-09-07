require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Match = require('../models/Match');
const { generarLiga } = require('./fixture');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar
    await User.deleteMany({});
    await Tournament.deleteMany({});
    await Team.deleteMany({});
    await Match.deleteMany({});
    console.log('🗑️  Datos anteriores eliminados');

    // Crear usuario demo
    const user = await User.create({
      nombre: 'Carlos Demo',
      email: 'demo@futbolapp.pe',
      password: 'demo1234',
      celular: '999888777',
      plan: 'free',
      torneosCreados: 1
    });
    console.log('👤 Usuario demo creado: demo@futbolapp.pe / demo1234');

    // Crear torneo demo
    const torneo = await Tournament.create({
      nombre: 'Copa del Barrio 2024',
      descripcion: 'Torneo relámpago del barrio con los equipos de siempre',
      formato: 'liga',
      modalidad: 'futbol7',
      creador: user._id,
      publicoId: 'demo2024',
      numEquipos: 4,
      ciudad: 'Lima',
      pais: 'Perú',
      estado: 'activo'
    });
    console.log('🏆 Torneo demo creado');

    // Crear equipos
    const equiposData = [
      { nombre: 'Los Cracks FC', color: '#22c55e', grupo: 'A' },
      { nombre: 'Real Pichangas', color: '#3b82f6', grupo: 'A' },
      { nombre: 'Deportivo Barrio', color: '#f59e0b', grupo: 'A' },
      { nombre: 'FC Amigos', color: '#ef4444', grupo: 'A' }
    ];

    const equipos = [];
    for (const data of equiposData) {
      const equipo = await Team.create({
        ...data,
        torneo: torneo._id,
        entrenador: 'DT ' + data.nombre
      });
      equipos.push(equipo);
    }
    console.log(`👥 ${equipos.length} equipos creados`);

    // Generar fixture
    const fixture = generarLiga(equipos.map(e => e._id));
    let jornada = 1;
    for (const j of fixture) {
      for (const p of j.partidos) {
        const local = equipos.find(e => e._id.equals(p.local));
        const visitante = equipos.find(e => e._id.equals(p.visitante));
        if (!local || !visitante) continue;

        await Match.create({
          torneo: torneo._id,
          fase: 'Fase de Liga',
          jornada: j.jornada,
          grupo: 'A',
          local: local._id,
          visitante: visitante._id,
          nombreLocal: local.nombre,
          nombreVisitante: visitante.nombre,
          golesLocal: Math.floor(Math.random() * 4),
          golesVisitante: Math.floor(Math.random() * 3),
          estado: 'finalizado'
        });
      }
    }

    // Actualizar estadísticas
    const partidos = await Match.find({ torneo: torneo._id, estado: 'finalizado' });
    for (const equipo of equipos) {
      let jugados = 0, ganados = 0, empatados = 0, perdidos = 0;
      let gf = 0, gc = 0;
      
      partidos.forEach(p => {
        if (p.local.equals(equipo._id)) {
          jugados++;
          gf += p.golesLocal;
          gc += p.golesVisitante;
          if (p.golesLocal > p.golesVisitante) ganados++;
          else if (p.golesLocal < p.golesVisitante) perdidos++;
          else empatados++;
        } else if (p.visitante.equals(equipo._id)) {
          jugados++;
          gf += p.golesVisitante;
          gc += p.golesLocal;
          if (p.golesVisitante > p.golesLocal) ganados++;
          else if (p.golesVisitante < p.golesLocal) perdidos++;
          else empatados++;
        }
      });

      equipo.estadisticas = {
        jugados,
        ganados,
        empatados,
        perdidos,
        golesFavor: gf,
        golesContra: gc,
        diferencia: gf - gc,
        puntos: ganados * 3 + empatados,
        amarillas: 0,
        rojas: 0
      };
      await equipo.save();
    }

    console.log(`⚽ ${partidos.length} partidos generados`);
    console.log('\n🎉 Seed completado!\n');
    console.log('📋 Datos de prueba:');
    console.log('   Email: demo@futbolapp.pe');
    console.log('   Password: demo1234');
    console.log('   Torneo público: /publico/demo2024\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

seed();
