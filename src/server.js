#!/usr/bin/env node

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');
const http = require('http');
const { Server } as require('socket.io');
const logger = require('winston');

// Configurar logger
logger.configure({
  level: 'info',
  format: logger.format.combine(
    logger.format.timestamp(),
    logger.format.errors({ stack: true }),
    logger.format.json()
  ),
  transports: [
    new logger.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new logger.transports.File({ filename: 'logs/combined.log' }),
    new logger.transports.Console({
      format: logger.format.combine(
        logger.format.colorize(),
        logger.format.simple()
      )
    })
  ]
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || "*",
    methods: ["GET", "POST"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://fuvev-cdn.torneoevgstream.workers.dev"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      frameSrc: ["'self'", "https://www.youtube.com"]
    }
  }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || "*",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Conectar a MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuvev', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
    logger.info(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

connectDB();

// Importar rutas
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/torneos', require('./src/routes/torneo.routes'));
app.use('/api/equipos', require('./src/routes/equipo.routes'));
app.use('/api/jugadores', require('./src/routes/jugador.routes'));
app.use('/api/partidos', require('./src/routes/partido.routes'));
app.use('/api/estadisticas', require('./src/routes/estadisticas.routes'));
app.use('/api/pagos', require('./src/routes/pago.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));
app.use('/api/public', require('./src/routes/public.routes'));

// Configurar Socket.IO para tiempo real
io.on('connection', (socket) => {
  logger.info('Nuevo cliente conectado', { socketId: socket.id });

  socket.on('join_tournament', (tournamentId) => {
    socket.join(`tournament_${tournamentId}`);
    logger.info(`Cliente se unió al torneo ${tournamentId}`, { socketId: socket.id });
  });

  socket.on('leave_tournament', (tournamentId) => {
    socket.leave(`tournament_${tournamentId}`);
  });

  socket.on('update_score', (data) => {
    io.to(`tournament_${data.tournamentId}`).emit('score_update', data);
  });

  socket.on('new_notification', (data) => {
    io.to(`user_${data.userId}`).emit('notification', data);
  });

  socket.on('disconnect', () => {
    logger.info('Cliente desconectado', { socketId: socket.id });
  });
});

// Servir archivos estáticos (para el frontend)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Para desarrollo, servir una página temporal
  app.get('/', (req, res) => {
    res.json({
      message: 'API de FUVEV funcionando',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        torneos: '/api/torneos',
        equipos: '/api/equipos',
        jugadores: '/api/jugadores',
        partidos: '/api/partidos',
        estadisticas: '/api/estadisticas',
        pagos: '/api/pagos',
        admin: '/api/admin',
        public: '/api/public'
      }
    });
  });
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  logger.info(`Servidor corriendo en puerto ${PORT}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Rejection:', { error: err.message, promise });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message });
  process.exit(1);
});

module.exports = app;