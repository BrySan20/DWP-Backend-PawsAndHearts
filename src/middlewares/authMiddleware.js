const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Obtener el token del header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bryan20');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);

    // Detectar si el error es porque el token expiró
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', expired: true });
    }

    return res.status(401).json({ error: 'No autorizado' });
  }
};

module.exports = authMiddleware;
