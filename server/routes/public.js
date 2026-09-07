const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Match = require('../models/Match');
const Player = require('../models/Player');

router.get('/t/:publicoId', async (req, res) => {
  try {
    const torneo = await Tournament.findOne({ publicoId: req.params.publicoId });
    if (!torneo || !torneo.compartir) {
      return res.status(404).json({ ok: false, msg: 'Torneo no encontrado' });
    }

    const equipos = await Team.find({ torneo: torneo._id });
    const partidos = await Match.find({ torneo: torneo._id }).sort({ jornada: 1, createdAt: 1 });

    const equiposConEstad = equipos.sort((a, b) => {
      if (b.estadisticas.puntos !== a.estadisticas.puntos) {
        return b.estadisticas.puntos - a.estadisticas.puntos;
      }
      if (b.estadisticas.diferencia !== a.estadisticas.diferencia) {
        return b.estadisticas.diferencia - a.estadisticas.diferencia;
      }
      return b.estadisticas.golesFavor - a.estadisticas.golesFavor;
    });

    res.json({
      ok: true,
      torneo,
      equipos: equiposConEstad,
      partidos
    });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error al obtener torneo público' });
  }
});

router.get('/t/:publicoId/goleadores', async (req, res) => {
  try {
    const torneo = await Tournament.findOne({ publicoId: req.params.publicoId });
    if (!torneo) return res.status(404).json({ ok: false, msg: 'No encontrado' });

    const jugadores = await Player.find({ torneo: torneo._id })
      .populate('equipo', 'nombre color')
      .sort({ 'estadisticas.goles': -1 })
      .limit(20);

    res.json({ ok: true, jugadores });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error' });
  }
});

router.get('/t/:publicoId/tarjetas', async (req, res) => {
  try {
    const torneo = await Tournament.findOne({ publicoId: req.params.publicoId });
    if (!torneo) return res.status(404).json({ ok: false, msg: 'No encontrado' });

    const jugadores = await Player.find({ torneo: torneo._id })
      .populate('equipo', 'nombre color')
      .sort({ 'estadisticas.amarillas': -1, 'estadisticas.rojas': -1 })
      .limit(20);

    res.json({ ok: true, jugadores });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error' });
  }
});

module.exports = router;
