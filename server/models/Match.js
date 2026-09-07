const mongoose = require('mongoose');

const incidenciaSchema = new mongoose.Schema({
  tipo: { 
    type: String, 
    enum: ['gol', 'amarilla', 'roja', 'azul', 'cambio'], 
    required: true 
  },
  jugador: { type: String, required: true },
  jugadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  equipo: { type: String, required: true },
  equipoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  minuto: { type: Number, default: 0 },
  detalle: { type: String, default: '' }
}, { timestamps: true });

const matchSchema = new mongoose.Schema({
  torneo: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  fase: { type: String, default: 'Fase 1' },
  jornada: { type: Number, default: 1 },
  grupo: { type: String, default: '' },
  local: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  visitante: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  nombreLocal: { type: String, default: '' },
  nombreVisitante: { type: String, default: '' },
  golesLocal: { type: Number, default: 0 },
  golesVisitante: { type: Number, default: 0 },
  penalesLocal: { type: Number, default: null },
  penalesVisitante: { type: Number, default: null },
  fecha: { type: Date },
  sede: { type: String, default: '' },
  estado: { 
    type: String, 
    enum: ['pendiente', 'en_vivo', 'finalizado'], 
    default: 'pendiente' 
  },
  incidencias: [incidenciaSchema],
  video: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', matchSchema);
