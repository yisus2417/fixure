require('dotenv').config();

const mongoose = require('mongoose');

// Esquema base de usuario
const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefono: { type: String },
  avatar: { type: String },
  confirmado: { type: Boolean, default: false },
  rol: { type: String, enum: ['usuario', 'admin', 'superadmin'], default: 'usuario' },
  plan: { type: String, enum: ['gratis', 'mensual', 'trimestral', 'semestral', 'anual'], default: 'gratis' },
  torneosCount: { type: Number, default: 0 },
  maxTorneos: { type: Number, default: 3 },
  fechaVencimiento: { type: Date },
  fechaCreacion: { type: Date, default: Date.now },
  ultimoAcceso: { type: Date, default: Date.now }
});

// Esquema de torneo
const torneoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  logo: { type: String },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  formato: { type: String, enum: ['liga', 'grupos', 'eliminacion', 'dobleEliminacion', 'suizo'], default: 'liga' },
  equipos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipo' }],
  faseActual: { type: String, default: 'grupos' },
  jornadaActual: { type: Number, default: 1 },
  estado: { type: String, enum: ['activo', 'proximo', 'en_curso', 'finalizado', 'suspendido'], default: 'activo' },
  sede: { type: String },
  fechaInicio: { type: Date },
  fechaFin: { type: Date },
  colorTema: { type: String, default: '#FF6B35' },
  reglas: {
    puntosVictoria: { type: Number, default: 3 },
    puntosEmpate: { type: Number, default: 1 },
    puntosDerrota: { type: Number, default: 0 },
    penalesAplican: { type: Boolean, default: false }
  },
  etiquetas: [{ type: String }],
  patrocinadores: [{
    nombre: String,
    logo: String,
    url: String
  }],
  zonas: [{
    nombre: String,
    equipos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipo' }]
  }],
  configFases: {
    tipo: { type: String, enum: ['manual', 'automatico'], default: 'automatico' },
    empatesPenales: { type: Boolean, default: false }
  },
  statsVisiblesPublico: {
    tablaPosiciones: { type: Boolean, default: true },
    goleadores: { type: Boolean, default: true },
    tarjetas: { type: Boolean, default: true },
    estadisticasEquipos: { type: Boolean, default: false },
    estadisticasAvanzadas: { type: Boolean, default: false }
  },
  slug: { type: String, unique: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

// Esquema de equipo
const equipoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  torneoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Torneo', required: true },
  grupo: { type: String },
  logo: { type: String },
  ciudad: { type: String },
  provincia: { type: String },
  pais: { type: String, default: 'PE' },
  entrenador: { type: String },
  colorEquipo: { type: String, default: '#1e40af' },
  colorAlternativo: { type: String, default: '#f59e0b' },
  jugadores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Jugador' }],
  estadisticas: {
    PJ: { type: Number, default: 0 },
    PG: { type: Number, default: 0 },
    PE: { type: Number, default: 0 },
    PP: { type: Number, default: 0 },
    GF: { type: Number, default: 0 },
    GC: { type: Number, default: 0 },
    DG: { type: Number, default: 0 },
    PTS: { type: Number, default: 0 }
  }
});

// Esquema de jugador
const jugadorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  equipoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipo', required: true },
  torneoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Torneo', required: true },
  numero: { type: Number },
  posicion: { type: String, enum: ['PORTERO', 'DEFENSA', 'MEDIO', 'DELANTERO'], default: 'DELANTERO' },
  foto: { type: String },
  edad: { type: Number },
  estadisticas: {
    partidos: { type: Number, default: 0 },
    goles: { type: Number, default: 0 },
    asistencias: { type: Number, default: 0 },
    amarillas: { type: Number, default: 0 },
    rojas: { type: Number, default: 0 },
    azules: { type: Number, default: 0 },
    penaltis: { type: Number, default: 0 },
    autogoles: { type: Number, default: 0 },
    vallasSinVencer: { type: Number, default: 0 }
  },
  fechaCreacion: { type: Date, default: Date.now }
});

// Esquema de partido
const partidoSchema = new mongoose.Schema({
  torneoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Torneo', required: true },
  fase: { type: String, required: true },
  jornada: { type: Number },
  fecha: { type: Date, required: true },
  hora: { type: String, required: true },
  sede: { type: String },
  equipoLocalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipo', required: true },
  equipoVisitanteId: { type: mongoose.Schema.Types.ObjectId, required: true },
  estado: { type: String, enum: ['programado', 'en_curso', 'terminado', 'postergado', 'cancelado'], default: 'programado' },
  resultado: {
    golesLocal: { type: Number, default: null },
    golesVisitante: { type: Number, default: null },
    penalesLocal: { type: Number, default: null },
    penalesVisitante: { type: Number, default: null }
  },
  tarjetas: {
    amarillasLocal: [{ jugadorId: mongoose.Schema.Types.ObjectId, minuto: Number }],
    rojasLocal: [{ jugadorId: mongoose.Schema.Types.ObjectId, minuto: Number }],
    azulesLocal: [{ jugadorId: mongoose.Schema.Types.ObjectId, minuto: Number }],
    amarillasVisitante: [{ jugadorId: mongoose.Schema.Types.ObjectId, minuto: Number }],
    rojasVisitante: [{ jugadorId: mongoose.Schema.Types.ObjectId, minuto: Number }],
    azulesVisitante: [{ jugadorId: mongoose.Schema.Types.ObjectId, minuto: Number }]
  },
  sustituciones: [{
    minuto: Number,
    jugadorSalienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jugador' },
    jugadorEntranteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jugador' }
  }],
  videoUrl: { type: String },
  observacion: { type: String },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

// Esquema de notificación
const notificacionSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  torneoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Torneo' },
  tipo: { type: String, enum: ['nuevo_partido', 'resultado', 'recordatorio', 'promocion', 'sistema'], required: true },
  titulo: { type: String, required: true },
  mensaje: { type: String, required: true },
  datos: { type: mongoose.Schema.Types.Mixed },
  leido: { type: Boolean, default: false },
  push: { type: Boolean, default: false },
  email: { type: Boolean, default: false },
  fechaCreacion: { type: Date, default: Date.now },
  fechaEnvio: { type: Date }
});

// Esquema de pago
const pagoSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  torneoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Torneo' },
  tipo: { type: String, enum: ['mensual', 'trimestral', 'semestral', 'anual'], required: true },
  monto: { type: Number, required: true },
  moneda: { type: String, default: 'PEN' },
  estado: { type: String, enum: ['pendiente', 'completado', 'fallido', 'reembolsado'], default: 'pendiente' },
  metodoPago: { type: String, enum: ['stripe', 'paypal', 'transferencia'], required: true },
  stripePagoId: { type: String },
  fechaPago: { type: Date },
  fechaCreacion: { type: Date, default: Date.now }
});

// Crear modelos
const User = mongoose.model('User', userSchema);
const Torneo = mongoose.model('Torneo', torneoSchema);
const Equipo = mongoose.model('Equipo', equipoSchema);
const Jugador = mongoose.model('Jugador', jugadorSchema);
const Partido = mongoose.model('Partido', partidoSchema);
const Notificacion = mongoose.model('Notificacion', notificacionSchema);
const Pago = mongoose.model('Pago', pagoSchema);

module.exports = {
  User,
  Torneo,
  Equipo,
  Jugador,
  Partido,
  Notificacion,
  Pago
};