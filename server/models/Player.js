const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  dorsal: { type: Number, default: 0 },
  equipo: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  torneo: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  posicion: { type: String, default: '' },
  edad: { type: Number },
  foto: { type: String, default: '' },
  estadisticas: {
    goles: { type: Number, default: 0 },
    amarillas: { type: Number, default: 0 },
    rojas: { type: Number, default: 0 },
    partidos: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Player', playerSchema);
