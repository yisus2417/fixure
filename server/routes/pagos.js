const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Pago = require('../models/Pago');

router.post('/solicitar', auth, async (req, res) => {
  try {
    const { metodo, operacion, comprobante } = req.body;

    if (!metodo) return res.status(400).json({ ok: false, msg: 'Método de pago requerido' });

    const pago = await Pago.create({
      usuario: req.user._id,
      monto: 20,
      metodo,
      operacion: operacion || '',
      comprobante: comprobante || ''
    });

    res.json({ 
      ok: true, 
      msg: 'Pago registrado. Será verificado en las próximas horas.',
      pago 
    });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error al registrar pago' });
  }
});

router.get('/mis-pagos', auth, async (req, res) => {
  try {
    const pagos = await Pago.find({ usuario: req.user._id }).sort({ createdAt: -1 });
    res.json({ ok: true, pagos });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error' });
  }
});

module.exports = router;
