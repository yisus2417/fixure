const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');

router.get('/torneo/:torneoId', auth, async (req, res) => {
  try {
    const torneo = await Tournament.findOne({ 
      _id: req.params.torneoId, 
      creador: req.user._id 
    });
    if (!torneo) return res.status(404).json({ ok: false, msg: 'Torneo no encontrado' });

    const equipos = await Team.find({ torneo: req.params.torneoId }).sort({ grupo: 1, nombre: 1 });
    res.json({ ok: true, equipos });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error al obtener equipos' });
  }
});

router.post('/torneo/:torneoId', auth, async (req, res) => {
  try {
    const torneo = await Tournament.findOne({ 
      _id: req.params.torneoId, 
      creador: req.user._id 
    });
    if (!torneo) return res.status(404).json({ ok: false, msg: 'Torneo no encontrado' });

    const { nombre, grupo, escudo, color, entrenador, delegado, celular } = req.body;

    if (!nombre) return res.status(400).json({ ok: false, msg: 'Nombre es obligatorio' });

    const equipo = await Team.create({
      nombre,
      torneo: req.params.torneoId,
      grupo: grupo || 'A',
      escudo: escudo || '',
      color: color || '#3b82f6',
      entrenador,
      delegado,
      celular
    });

    res.json({ ok: true, equipo });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error al crear equipo' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const equipo = await Team.findById(req.params.id).populate('torneo');
    if (!equipo || equipo.torneo.creador.toString() !== req.user._id.toString()) {
      return res.status(404).json({ ok: false, msg: 'Equipo no encontrado' });
    }

    const campos = ['nombre', 'grupo', 'escudo', 'color', 'entrenador', 'delegado', 'celular'];
    campos.forEach(campo => {
      if (req.body[campo] !== undefined) equipo[campo] = req.body[campo];
    });

    await equipo.save();
    res.json({ ok: true, equipo });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error al actualizar equipo' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const equipo = await Team.findById(req.params.id).populate('torneo');
    if (!equipo || equipo.torneo.creador.toString() !== req.user._id.toString()) {
      return res.status(404).json({ ok: false, msg: 'Equipo no encontrado' });
    }

    await equipo.deleteOne();
    res.json({ ok: true, msg: 'Equipo eliminado' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error al eliminar equipo' });
  }
});

module.exports = router;
