const jwtUtils = require('../config/jwt');

const authMiddleware = {
  // Middleware para proteger rutas
  protect: (req, res, next) => {
    let token;
    
    // Verificar si el token está en los headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Por favor inicia sesión.'
      });
    }
    
    try {
      // Verificar token
      const decoded = jwtUtils.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
  }
};

module.exports = authMiddleware;