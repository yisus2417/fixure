const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Match = require('../models/Match');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Tournament = require('../models/Tournament');

router.get('/:id', auth, async (req, res) => {
  try {
    const partido = await Match.findById(req.params.id);
    if (!partido) return res.status(404).json({ ok: false, msg: 'Partido no encontrado' });

    const torneo = await Tournament.findById(partido.torneo);
    if (torneo.creador.toString() !== req.user._id.toString()) {
      return res.status(403).json({ ok: false, msg: 'No autorizado' });
    }

    res.json({ ok: true, partido });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error al obtener partido' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const partido = await Match.findById(req.params.id);
    if (!partido) return res.status(404).json({ ok: false, msg: 'Partido no encontrado' });

    const torneo = await Tournament.findById(partido.torneo);
    if (torneo.creador.toString() !== req.user._id.toString()) {
      return res.status(403).json({ ok: false, msg: 'No autorizado' });
    }

    const campos = ['fecha', 'sede', 'estado', 'golesLocal', 'golesVisitante', 
                    'penalesLocal', 'penalesVisitante', 'video'];
    campos.forEach(campo => {
      if (req.body[campo] !== undefined) partido[campo] = req.body[campo];
    });

    await partido.save();

    if (partido.estado === 'finalizado') {
      await actualizarEstadisticas(partido, torneo);
    }

    res.json({ ok: true, partido });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error al actualizar partido' });
  }
});

router.post('/:id/incidencia', auth, async (req, res) => {
  try {
    const { tipo, jugador, jugadorId, equipo, equipoId, minuto, detalle } = req.body;

    const partido = await Match.findById(req.params.id);
    if (!partido) return res.status(404).json({ ok: false, msg: 'Partido no encontrado' });

    const torneo = await Tournament.findById(partido.torneo);
    if (torneo.creador.toString() !== req.user._id.toString()) {
      return res.status(403).json({ ok: false, msg: 'No autorizado' });
    }

    partido.incidencias.push({ tipo, jugador, jugadorId, equipo, equipoId, minuto, detalle });

    if (tipo === 'gol') {
      if (equipoId?.toString() === partido.local?.toString()) {
        partido.golesLocal += 1;
      } else if (equipoId?.toString() === partido.visitante?.toString()) {
        partido.golesVisitante += 1;
      }
    }

    await partido.save();
    res.json({ ok: true, partido });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error al agregar incidencia' });
  }
});

router.delete('/:id/incidencia/:incidenciaId', auth, async (req, res) => {
  try {
    const partido = await Match.findById(req.params.id);
    if (!partido) return res.status(404).json({ ok: false, msg: 'Partido no encontrado' });

    const torneo = await Tournament.findById(partido.torneo);
    if (torneo.creador.toString() !== req.user._id.toString()) {
      return res.status(403).json({ ok: false, msg: 'No autorizado' });
    }

    const incidencia = partido.incidencias.id(req.params.incidenciaId);
    if (!incidencia) return res.status(404).json({ ok: false, msg: 'Incidencia no encontrada' });

    if (incidencia.tipo === 'gol') {
      if (incidencia.equipoId?.toString() === partido.local?.toString()) {
        partido.golesLocal = Math.max(0, partido.golesLocal - 1);
      } else if (incidencia.equipoId?.toString() === partido.visitante?.toString()) {
        partido.golesVisitante = Math.max(0, partido.golesVisitante - 1);
      }
    }

    incidencia.deleteOne();
    await partido.save();
    res.json({ ok: true, partido });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error al eliminar incidencia' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const partido = await Match.findById(req.params.id);
    if (!partido) return res.status(404).json({ ok: false, msg: 'Partido no encontrado' });

    const torneo = await Tournament.findById(partido.torneo);
    if (torneo.creador.toString() !== req.user._id.toString()) {
      return res.status(403).json({ ok: false, msg: 'No autorizado' });
    }

    await partido.deleteOne();
    res.json({ ok: true, msg: 'Partido eliminado' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error al eliminar partido' });
  }
});

async function actualizarEstadisticas(partido, torneo) {
  const local = await Team.findById(partido.local);
  const visitante = await Team.findById(partido.visitante);
  if (!local || !visitante) return;

  local.estadisticas.jugados += 1;
  visitante.estadisticas.jugados += 1;
  local.estadisticas.golesFavor += partido.golesLocal;
  local.estadisticas.golesContra += partido.golesVisitante;
  visitante.estadisticas.golesFavor += partido.golesVisitante;
  visitante.estadisticas.golesContra += partido.golesLocal;

  if (partido.golesLocal > partido.golesVisitante) {
    local.estadisticas.ganados += 1;
    local.estadisticas.puntos += torneo.puntosVictoria;
    visitante.estadisticas.perdidos += 1;
    visitante.estadisticas.puntos += torneo.puntosDerrota;
  } else if (partido.golesLocal < partido.golesVisitante) {
    visitante.estadisticas.ganados += 1;
    visitante.estadisticas.puntos += torneo.puntosVictoria;
    local.estadisticas.perdidos += 1;
    local.estadisticas.puntos += torneo.puntosDerrota;
  } else {
    local.estadisticas.empatados += 1;
    visitante.estadisticas.empatados += 1;
    local.estadisticas.puntos += torneo.puntosEmpate;
    visitante.estadisticas.puntos += torneo.puntosEmpate;
  }

  local.estadisticas.diferencia = local.estadisticas.golesFavor - local.estadisticas.golesContra;
  visitante.estadisticas.diferencia = visitante.estadisticas.golesFavor - visitante.estadisticas.golesContra;

  partido.incidencias.forEach(inc => {
    if (inc.tipo === 'amarilla') {
      if (inc.equipoId?.toString() === local._id.toString()) local.estadisticas.amarillas += 1;
      else visitante.estadisticas.amarillas += 1;
    } else if (inc.tipo === 'roja') {
      if (inc.equipoId?.toString() === local._id.toString()) local.estadisticas.rojas += 1;
      else visitante.estadisticas.rojas += 1;
    }
  });

  await local.save();
  await visitante.save();
}

module.exports = router;
