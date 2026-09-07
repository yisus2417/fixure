require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/futbolapp')
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/torneos', require('./routes/torneos'));
app.use('/api/equipos', require('./routes/equipos'));
app.use('/api/jugadores', require('./routes/jugadores'));
app.use('/api/partidos', require('./routes/partidos'));
app.use('/api/pagos', require('./routes/pagos'));
app.use('/api/public', require('./routes/public'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, msg: 'FútbolApp API funcionando', time: new Date() });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/registro.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/torneo/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/torneo.html'));
});

app.get('/partido/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/partido.html'));
});

app.get('/planes', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/planes.html'));
});

app.get('/publico/:publicoId', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/publico.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ ok: false, msg: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 FútbolApp corriendo en http://localhost:${PORT}`);
});
