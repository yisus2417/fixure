const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  torneo: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  grupo: { type: String, default: 'A' },
  escudo: { type: String, default: '' },
  color: { type: String, default: '#3b82f6' },
  entrenador: { type: String, default: '' },
  delegado: { type: String, default: '' },
  celular: { type: String, default: '' },
  eliminado: { type: Boolean, default: false },
  estadisticas: {
    jugados: { type: Number, default: 0 },
    ganados: { type: Number, default: 0 },
    empatados: { type: Number, default: 0 },
    perdidos: { type: Number, default: 0 },
    golesFavor: { type: Number, default: 0 },
    golesContra: { type: Number, default: 0 },
    diferencia: { type: Number, default: 0 },
    puntos: { type: Number, default: 0 },
    amarillas: { type: Number, default: 0 },
    rojas: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', teamSchema);
