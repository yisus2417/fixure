const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ ok: false, msg: 'No autorizado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.activo) {
      return res.status(401).json({ ok: false, msg: 'Usuario no válido' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, msg: 'Token no válido' });
  }
};
