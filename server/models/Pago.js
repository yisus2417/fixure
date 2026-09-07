const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, default: 'pro' },
  monto: { type: Number, required: true },
  moneda: { type: String, default: 'PEN' },
  metodo: { 
    type: String, 
    enum: ['yape', 'plin', 'transferencia', 'stripe'], 
    required: true 
  },
  operacion: { type: String, default: '' },
  comprobante: { type: String, default: '' },
  estado: { 
    type: String, 
    enum: ['pendiente', 'aprobado', 'rechazado'], 
    default: 'pendiente' 
  },
  notas: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  procesadoAt: { type: Date }
});

module.exports = mongoose.model('Pago', pagoSchema);
