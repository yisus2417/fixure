const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User } = require('./models');

class AuthService {
  // Generar token JWT
  static generateToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Registrar nuevo usuario
  static async registrarUsuario(data) {
    const { nombre, email, password } = data;

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      throw new Error('Este correo electrónico ya está registrado');
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear usuario
    const nuevoUsuario = new User({
      nombre,
      email,
      password: passwordHash,
      confirmado: process.env.NODE_ENV === 'development' // Auto-confirmar en desarrollo
    });

    const usuarioGuardado = await nuevoUsuario.save();

    // Generar token
    const token = this.generateToken(usuarioGuardado._id);

    // Enviar correo de confirmación (opcional)
    if (!process.env.NODE_ENV === 'development') {
      await this.enviarCorreoConfirmacion(usuarioGuardado.email, token);
    }

    // Quitar password del retorno
    usuarioGuardado.password = undefined;

    return {
      usuario: usuarioGuardado,
      token
    };
  }

  // Login de usuario
  static async loginUsuario(email, password) {
    const usuario = await User.findOne({ email }).select('+password');

    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const esValida = await bcrypt.compare(password, usuario.password);

    if (!esValida) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si el usuario está confirmado
    if (!usuario.confirmado) {
      throw new Error('Por favor confirma tu correo electrónico');
    }

    // Actualizar último acceso
    usuario.ultimoAcceso = new Date();
    await usuario.save();

    // Generar token
    const token = this.generateToken(usuario._id);

    // Quitar password del retorno
    usuario.password = undefined;

    return {
      usuario,
      token
    };
  }

  // Enviar correo de confirmación
  static async enviarCorreoConfirmacion(email, token) {
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirmar-correo/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@fuvev.com',
      to: email,
      subject: 'Confirma tu correo electrónico - FUVEV',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">¡Bienvenido a FUVEV!</h2>
          <p>Por favor confirma tu correo electrónico haciendo clic en el botón de abajo:</p>
          <a href="${confirmUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Confirmar correo electrónico</a>
          <p>Si el botón no funciona, copia y pega este enlace: ${confirmUrl}</p>
          <p><small>Este enlace expira en 24 horas.</small></p>
        </div>
      `
    });
  }

  // Confirmar correo electrónico con token
  static async confirmarCorreo(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const usuario = await User.findById(decoded.id);

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      if (usuario.confirmado) {
        throw new Error('El correo electrónico ya ha sido confirmado');
      }

      usuario.confirmado = true;
      await usuario.save();

      return usuario;
    } catch (error) {
      throw new Error('Token de confirmación inválido o expirado');
    }
  }

  // Solicitar recuperación de contraseña
  static async solicitarRecuperacionPassword(email) {
    const usuario = await User.findOne({ email });

    if (!usuario) {
      // No revelar si el usuario existe o no por seguridad
      return { mensaje: 'Si el correo está registrado, recibirás un enlace para restablecer la contraseña' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpira = Date.now() + 3600000; // 1 hora

    usuario.resetPasswordToken = resetToken;
    usuario.resetPasswordExpires = resetTokenExpira;
    await usuario.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/restablecer-password/${resetToken}`;

    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@fuvev.com',
      to: email,
      subject: 'Restablecer contraseña - FUVEV',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Restablecer tu contraseña</h2>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Restablecer contraseña</a>
          <p>Si el botón no funciona, copia y pega este enlace: ${resetUrl}</p>
          <p><small>Este enlace expira en 1 hora.</small></p>
        </div>
      `
    });

    return { mensaje: 'Si el correo está registrado, recibirás un enlace para restablecer la contraseña' };
  }

  // Restablecer contraseña
  static async restablecerPassword(token, nuevaPassword) {
    try {
      const usuario = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!usuario) {
        throw new Error('Token de restablecimiento de contraseña inválido o expirado');
      }

      const salt = await bcrypt.genSalt(12);
      usuario.password = await bcrypt.hash(nuevaPassword, salt);
      usuario.resetPasswordToken = undefined;
      usuario.resetPasswordExpires = undefined;
      await usuario.save();

      return usuario;
    } catch (error) {
      throw new Error('Error al restablecer la contraseña');
    }
  }

  // Refrescar token
  static async refrescarToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const usuario = await User.findById(decoded.id);

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      const nuevoToken = this.generateToken(usuario._id);

      return {
        token: nuevoToken,
        usuario
      };
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  // Actualizar perfil
  static async actualizarPerfil(usuarioId, datos) {
    const camposPermitidos = ['nombre', 'telefono', 'avatar'];
    const datosFiltrados = {};

    Object.keys(datos).forEach(clave => {
      if (camposPermitidos.includes(clave)) {
        datosFiltrados[clave] = datos[clave];
      }
    });

    const usuario = await User.findByIdAndUpdate(
      usuarioId,
      datosFiltrados,
      { new: true, runValidators: true }
    );

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    return usuario;
  }

  // Cambiar contraseña
  static async cambiarPassword(usuarioId, passwordActual, nuevaPassword) {
    const usuario = await User.findById(usuarioId).select('+password');

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const esValida = await bcrypt.compare(passwordActual, usuario.password);

    if (!esValida) {
      throw new Error('La contraseña actual es incorrecta');
    }

    const salt = await bcrypt.genSalt(12);
    usuario.password = await bcrypt.hash(nuevaPassword, salt);
    await usuario.save();

    return usuario;
  }
}

module.exports = AuthService;