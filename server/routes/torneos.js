const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Match = require('../models/Match');
const { generarPublicId, generarLiga, generarEliminacion, generarGrupos } = require('../utils/fixture');

router.get('/', auth, async (req, res) => {
  try {
    const torneos = await Tournament.find({ creador: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ ok: true, torneos });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error al obtener torneos' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const torneo = await Tournament.findOne({ 
      _id: req.params.id, 
      creador: req.user._id 
    });
    if (!torneo) return res.status(404).json({ ok: false, msg: 'Torneo no encontrado' });
    res.json({ ok: true, torneo });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error al obtener torneo' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    if (!req.user.puedeCrearTorneo()) {
      return res.status(403).json({ 
        ok: false, 
        msg: 'Has alcanzado el límite de 3 torneos gratuitos. Actualiza al plan PRO (S/ 20) para crear más.' 
      });
    }

    const { nombre, descripcion, formato, modalidad, numGrupos, fechaInicio, sede, ciudad } = req.body;

    if (!nombre || !formato) {
      return res.status(400).json({ ok: false, msg: 'Nombre y formato son obligatorios' });
    }

    const torneo = await Tournament.create({
      nombre,
      descripcion,
      formato,
      modalidad: modalidad || 'futbol7',
      numGrupos: numGrupos || 1,
      creador: req.user._id,
      publicoId: generarPublicId(),
      fechaInicio,
      sede,
      ciudad
    });

    req.user.torneosCreados += 1;
    await req.user.save();

    res.json({ ok: true, torneo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error al crear torneo' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const torneo = await Tournament.findOne({ 
      _id: req.params.id, 
      creador: req.user._id 
    });
    if (!torneo) return res.status(404).json({ ok: false, msg: 'Torneo no encontrado' });

    const campos = ['nombre', 'descripcion', 'modalidad', 'numGrupos', 'clasificanPorGrupo', 
                    'puntosVictoria', 'puntosEmpate', 'puntosDerrota', 'estado', 
                    'fechaInicio', 'fechaFin', 'sede', 'ciudad', 'logo', 'compartir'];
    
    campos.forEach(campo => {
      if (req.body[campo] !== undefined) torneo[campo] = req.body[campo];
    });

    await torneo.save();
    res.json({ ok: true, torneo });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error al actualizar torneo' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const torneo = await Tournament.findOne({ 
      _id: req.params.id, 
      creador: req.user._id 
    });
    if (!torneo) return res.status(404).json({ ok: false, msg: 'Torneo no encontrado' });

    await Team.deleteMany({ torneo: torneo._id });
    await Match.deleteMany({ torneo: torneo._id });
    await torneo.deleteOne();

    if (req.user.torneosCreados > 0) {
      req.user.torneosCreados -= 1;
      await req.user.save();
    }

    res.json({ ok: true, msg: 'Torneo eliminado' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error al eliminar torneo' });
  }
});

router.post('/:id/generar-fixture', auth, async (req, res) => {
  try {
    const torneo = await Tournament.findOne({ 
      _id: req.params.id, 
      creador: req.user._id 
    });
    if (!torneo) return res.status(404).json({ ok: false, msg: 'Torneo no encontrado' });

    const equipos = await Team.find({ torneo: torneo._id });
    if (equipos.length < 2) {
      return res.status(400).json({ ok: false, msg: 'Necesitas al menos 2 equipos' });
    }

    await Match.deleteMany({ torneo: torneo._id });

    const equiposIds = equipos.map(e => e._id);
    const equiposPorGrupo = {};

    let fixture;
    if (torneo.formato === 'liga') {
      fixture = generarLiga(equiposIds);
      fixture.forEach(j => {
        j.partidos.forEach(p => {
          const local = equipos.find(e => e._id.equals(p.local));
          const visitante = equipos.find(e => e._id.equals(p.visitante));
          if (local && visitante) {
            equiposPorGrupo[local._id] = local.grupo;
          }
        });
      });
    } else if (torneo.formato === 'eliminacion') {
      const resultado = generarEliminacion(equiposIds);
      fixture = resultado[0].partidos.map((p, i) => ({
        jornada: 1,
        fase: 'Eliminación Directa',
        partidoIdx: i,
        partidos: [p]
      }));
    } else if (torneo.formato === 'grupos') {
      const numGrupos = torneo.numGrupos || 2;
      const gruposArray = generarGrupos(equiposIds, numGrupos);
      fixture = gruposArray;
      
      equipos.forEach(e => {
        const grupoObj = gruposArray.find(g => g.grupo === e.grupo);
      });
    } else if (torneo.formato === 'doble_eliminacion') {
      const resultado = generarEliminacion(equiposIds);
      fixture = resultado[0].partidos.map((p, i) => ({
        jornada: 1,
        fase: 'Doble Eliminación - Superior',
        partidoIdx: i,
        partidos: [p]
      }));
    }

    const partidosCreados = [];
    for (const jornada of fixture) {
      for (const partido of jornada.partidos) {
        const local = equipos.find(e => e._id.equals(partido.local));
        const visitante = equipos.find(e => e._id.equals(partido.visitante));
        if (!local || !visitante) continue;

        const nuevoPartido = await Match.create({
          torneo: torneo._id,
          fase: jornada.fase || 'Fase de Liga',
          jornada: jornada.jornada,
          grupo: jornada.grupo || local.grupo,
          local: local._id,
          visitante: visitante._id,
          nombreLocal: local.nombre,
          nombreVisitante: visitante.nombre,
          estado: 'pendiente'
        });
        partidosCreados.push(nuevoPartido);
      }
    }

    torneo.numEquipos = equipos.length;
    await torneo.save();

    res.json({ ok: true, partidos: partidosCreados.length, total: partidosCreados });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error al generar fixture' });
  }
});

router.get('/:id/partidos', auth, async (req, res) => {
  try {
    const partidos = await Match.find({ torneo: req.params.id })
      .sort({ jornada: 1, createdAt: 1 });
    res.json({ ok: true, partidos });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error al obtener partidos' });
  }
});

module.exports = router;
