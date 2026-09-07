const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password, celular } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ ok: false, msg: 'Todos los campos son obligatorios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ ok: false, msg: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ ok: false, msg: 'El email ya está registrado' });
    }

    const user = await User.create({ nombre, email, password, celular });

    const token = generarToken(user._id);

    res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        plan: user.plan,
        torneosCreados: user.torneosCreados
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error al registrar usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, msg: 'Email y contraseña son obligatorios' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ ok: false, msg: 'Credenciales inválidas' });
    }

    if (!user.activo) {
      return res.status(401).json({ ok: false, msg: 'Cuenta desactivada' });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ ok: false, msg: 'Credenciales inválidas' });
    }

    const token = generarToken(user._id);

    res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        celular: user.celular,
        plan: user.plan,
        planVence: user.planVence,
        torneosCreados: user.torneosCreados
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error al iniciar sesión' });
  }
});

router.get('/me', require('../middleware/auth'), async (req, res) => {
  res.json({
    ok: true,
    user: {
      id: req.user._id,
      nombre: req.user.nombre,
      email: req.user.email,
      celular: req.user.celular,
      plan: req.user.plan,
      planVence: req.user.planVence,
      torneosCreados: req.user.torneosCreados
    }
  });
});

module.exports = router;
