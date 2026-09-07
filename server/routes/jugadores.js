const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Player = require('../models/Player');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');

router.get('/equipo/:equipoId', auth, async (req, res) => {
  try {
    const jugadores = await Player.find({ equipo: req.params.equipoId }).sort({ dorsal: 1 });
    res.json({ ok: true, jugadores });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error' });
  }
});

router.post('/equipo/:equipoId', auth, async (req, res) => {
  try {
    const { nombre, dorsal, posicion, edad, foto } = req.body;

    if (!nombre) return res.status(400).json({ ok: false, msg: 'Nombre es obligatorio' });

    const equipo = await Team.findById(req.params.equipoId).populate('torneo');
    if (!equipo || equipo.torneo.creador.toString() !== req.user._id.toString()) {
      return res.status(404).json({ ok: false, msg: 'Equipo no encontrado' });
    }

    const jugador = await Player.create({
      nombre,
      dorsal: dorsal || 0,
      posicion,
      edad,
      foto,
      equipo: req.params.equipoId,
      torneo: equipo.torneo._id
    });

    res.json({ ok: true, jugador });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error al crear jugador' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const jugador = await Player.findById(req.params.id).populate({
      path: 'equipo',
      populate: { path: 'torneo' }
    });

    if (!jugador || jugador.equipo.torneo.creador.toString() !== req.user._id.toString()) {
      return res.status(404).json({ ok: false, msg: 'Jugador no encontrado' });
    }

    const campos = ['nombre', 'dorsal', 'posicion', 'edad', 'foto'];
    campos.forEach(campo => {
      if (req.body[campo] !== undefined) jugador[campo] = req.body[campo];
    });

    await jugador.save();
    res.json({ ok: true, jugador });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const jugador = await Player.findById(req.params.id).populate({
      path: 'equipo',
      populate: { path: 'torneo' }
    });

    if (!jugador || jugador.equipo.torneo.creador.toString() !== req.user._id.toString()) {
      return res.status(404).json({ ok: false, msg: 'Jugador no encontrado' });
    }

    await jugador.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error' });
  }
});

module.exports = router;
