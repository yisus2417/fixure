const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  celular: { type: String, trim: true },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  planVence: { type: Date, default: null },
  torneosCreados: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.puedeCrearTorneo = function() {
  if (this.plan === 'pro' && this.planVence && this.planVence > new Date()) {
    return true;
  }
  return this.torneosCreados < 3;
};

module.exports = mongoose.model('User', userSchema);
