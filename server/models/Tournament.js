const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, maxlength: 280 },
  creador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  formato: { 
    type: String, 
    enum: ['liga', 'eliminacion', 'grupos', 'doble_eliminacion'], 
    default: 'liga' 
  },
  modalidad: { 
    type: String, 
    enum: ['futbol11', 'futbol7', 'futbol5', 'futsal'], 
    default: 'futbol7' 
  },
  numEquipos: { type: Number, default: 0 },
  numGrupos: { type: Number, default: 1 },
  equiposPorGrupo: { type: Number, default: 0 },
  clasificanPorGrupo: { type: Number, default: 2 },
  puntosVictoria: { type: Number, default: 3 },
  puntosEmpate: { type: Number, default: 1 },
  puntosDerrota: { type: Number, default: 0 },
  estado: { 
    type: String, 
    enum: ['activo', 'proximo', 'finalizado', 'suspendido'], 
    default: 'activo' 
  },
  fechaInicio: { type: Date },
  fechaFin: { type: Date },
  sede: { type: String, default: '' },
  ciudad: { type: String, default: '' },
  pais: { type: String, default: 'Perú' },
  logo: { type: String, default: '' },
  publicoId: { type: String, unique: true, required: true },
  compartir: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

tournamentSchema.index({ publicoId: 1 });

module.exports = mongoose.model('Tournament', tournamentSchema);
