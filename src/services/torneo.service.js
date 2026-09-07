const { Torneo, Equipo, Jugador, Partido } = require('../models');
const AuthService = require('./auth.service');

class TorneoService {
  // Obtener torneos del usuario
  static async obtenerTorneosUsuario(usuarioId) {
    return await Torneo.find({ adminId: usuarioId }).sort({ fechaCreacion: -1 });
  }

  // Crear torneo
  static async crearTorneo(usuarioId, datosTorneo) {
    const {
      nombre,
      descripcion,
      formato,
      fechaInicio,
      fechaFin,
      colorTema,
      reglas,
      etiquetas,
      patrocinadores,
      zonas,
      configFases,
      statsVisiblesPublico,
      sede
    } = datosTorneo;

    // Verificar límites del plan
    const usuario = await AuthService.getUserById(usuarioId);
    const torneosCount = await Torneo.countDocuments({ adminId: usuarioId });

    if (torneosCount >= usuario.maxTorneos) {
      throw new Error(`Has alcanzado el límite de ${usuario.maxTorneos} torneos de tu plan actual`);
    }

    // Generar slug
    const slug = this.generarSlug(nombre);

    // Crear torneo
    const nuevoTorneo = new Torneo({
      nombre,
      descripcion,
      formato,
      fechaInicio,
      fechaFin,
      colorTema,
      reglas,
      etiquetas,
      patrocinadores,
      zonas,
      configFases,
      statsVisiblesPublico,
      adminId: usuarioId,
      slug,
      sede
    });

    const torneoGuardado = await nuevoTorneo.save();

    // Actualizar contador de torneos del usuario
    await AuthService.actualizarTorneoCount(usuarioId, 1);

    return torneoGuardado;
  }

  // Obtener torneo por ID
  static async obtenerTorneoPorId(torneoId) {
    return await Torneo.findById(torneoId)
      .populate('adminId', 'nombre email avatar')
      .populate('equipos');
  }

  // Obtener torneo por slug
  static async obtenerTorneoPorSlug(slug) {
    return await Torneo.findOne({ slug })
      .populate('adminId', 'nombre email avatar')
      .populate('equipos');
  }

  // Actualizar torneo
  static async actualizarTorneo(torneoId, datosActualizados, usuarioId) {
    // Verificar que el usuario es el admin del torneo
    const torneo = await Torneo.findById(torneoId);

    if (!torneo) {
      throw new Error('Torneo no encontrado');
    }

    if (torneo.adminId.toString() !== usuarioId.toString()) {
      throw new Error('No tienes permiso para editar este torneo');
    }

    const torneoActualizado = await Torneo.findByIdAndUpdate(
      torneoId,
      { ...datosActualizados, fechaActualizacion: Date.now() },
      { new: true, runValidators: true }
    );

    return torneoActualizado;
  }

  // Eliminar torneo
  static async eliminarTorneo(torneoId, usuarioId) {
    const torneo = await Torneo.findById(torneoId);

    if (!torneo) {
      throw new Error('Torneo no encontrado');
    }

    if (torneo.adminId.toString() !== usuarioId.toString()) {
      throw new Error('No tienes permiso para eliminar este torneo');
    }

    // Eliminar todos los datos relacionados
    await Partido.deleteMany({ torneoId });
    await Jugador.deleteMany({ torneoId });
    await Equipo.deleteMany({ torneoId });

    await Torneo.findByIdAndDelete(torneoId);

    // Decrementar contador de torneos del usuario
    await AuthService.actualizarTorneoCount(usuarioId, -1);

    return { mensaje: 'Torneo eliminado exitosamente' };
  }

  // Generar slug para torneo
  static generarSlug(nombre) {
    return nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Calcular estadisticas de torneo
  static async calcularEstadisticasTorneo(torneoId) {
    const partidos = await Partido.find({ torneoId }).populate('equipoLocalId equipoVisitanteId');
    const equipos = await Equipo.find({ torneoId });

    // Calcular estadísticas de equipos
    for (const equipo of equipos) {
      const partidosEquipo = partidos.filter(p =>
        p.equipoLocalId._id.toString() === equipo._id.toString() ||
        p.equipoVisitanteId._id.toString() === equipo._id.toString()
      );

      let PJ = 0, PG = 0, PE = 0, PP = 0, GF = 0, GC = 0;

      for (const partido of partidosEquipo) {
        const esLocal = partido.equipoLocalId._id.toString() === equipo._id.toString();
        const golesLocal = partido.resultado?.golesLocal || 0;
        const golesVisitante = partido.resultado?.golesVisitante || 0;

        if (partido.estado !== 'terminado') continue;

        PJ++;
        GF += esLocal ? golesLocal : golesVisitante;
        GC += esLocal ? golesVisitante : golesLocal;

        if (golesLocal > golesVisitante) {
          if (esLocal) PG++; else PP++;
        } else if (golesLocal < golesVisitante) {
          if (esLocal) PP++; else PG++;
        } else {
          PE++;
        }
      }

      const DG = GF - GC;
      const PTS = PG * 3 + PE * 1;

      await Equipo.findByIdAndUpdate(equipo._id, {
        'estadisticas.PJ': PJ,
        'estadisticas.PG': PG,
        'estadisticas.PE': PE,
        'estadisticas.PP': PP,
        'estadisticas.GF': GF,
        'estadisticas.GC': GC,
        'estadisticas.DG': DG,
        'estadisticas.PTS': PTS
      });
    }

    // Calcular estadísticas de jugadores
    const jugadores = await Jugador.find({ torneoId }).populate('equipoId');

    for (const jugador of jugadores) {
      const partidosJugador = partidos.filter(p =>
        p.tarjetas.amarillasLocal.some(t => t.jugadorId.toString() === jugador._id.toString()) ||
        p.tarjetas.rojasLocal.some(t => t.jugadorId.toString() === jugador._id.toString()) ||
        p.tarjetas.azulesLocal.some(t => t.jugadorId.toString() === jugador._id.toString()) ||
        p.tarjetas.amarillasVisitante.some(t => t.jugadorId.toString() === jugador._id.toString()) ||
        p.tarjetas.rojasVisitante.some(t => t.jugadorId.toString() === jugador._id.toString()) ||
        p.tarjetas.azulesVisitante.some(t => t.jugadorId.toString() === jugador._id.toString())
      );

      let goles = 0, amarillas = 0, rojas = 0, azules = 0;

      for (const partido of partidosJugador) {
        const esLocal = partido.equipoLocalId._id.toString() === jugador.equipoId._id.toString();

        if (esLocal) {
          goles += partido.resultado?.golesLocal || 0;
          amarillas += partido.tarjetas.amarillasLocal.filter(t => t.jugadorId.toString() === jugador._id.toString()).length;
          rojas += partido.tarjetas.rojasLocal.filter(t => t.jugadorId.toString() === jugador._id.toString()).length;
          azules += partido.tarjetas.azulesLocal.filter(t => t.jugadorId.toString() === jugador._id.toString()).length;
        } else {
          goles += partido.resultado?.golesVisitante || 0;
          amarillas += partido.tarjetas.amarillasVisitante.filter(t => t.jugadorId.toString() === jugador._id.toString()).length;
          rojas += partido.tarjetas.rojasVisitante.filter(t => t.jugadorId.toString() === jugador._id.toString()).length;
          azules += partido.tarjetas.azulesVisitante.filter(t => t.jugadorId.toString() === jugador._id.toString()).length;
        }
      }

      await Jugador.findByIdAndUpdate(jugador._id, {
        'estadisticas.goles': goles,
        'estadisticas.amarillas': amarillas,
        'estadisticas.rojas': rojas,
        'estadisticas.azules': azules
      });
    }

    // Obtener estadísticas actualizadas
    return {
      equipos: await Equipo.find({ torneoId }).sort({ 'estadisticas.PTS': -1, 'estadisticas.DG': -1, 'estadisticas.GF': -1 }),
      jugadores: await Jugador.find({ torneoId }).sort({ 'estadisticas.goles': -1, 'estadisticas.amarillas': -1 }).populate('equipoId'),
      partidos: await Partido.find({ torneoId }).sort({ fecha: 1 })
    };
  }
}

module.exports = TorneoService;