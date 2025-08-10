const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwtUtils = require('../config/jwt');

const authController = {
  // Registrar nuevo usuario
  register: async (req, res) => {
    const { nombre_empresa, gmail, contraseña, estado, sector, num_empleados, actividad_principal} = req.body;
    
    try {
      // Verificar si el email ya existe
      const [existingUser] = await db.promise().query(
        'SELECT * FROM usuarios WHERE gmail = ?', 
        [gmail]
      );
      
      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico ya está registrado'
        });
      }
      
      // Hash de la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(contraseña, salt);
      
      // Insertar nuevo usuario
      const [userResult] = await db.promise().query(
        'INSERT INTO usuarios (nombre_empresa, gmail, contraseña, estado, sector, actividad_principal, num_empleados) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nombre_empresa, gmail, hashedPassword, estado, sector, actividad_principal, num_empleados]
      );
      
      const userId = userResult.insertId;
      
      // Generar token JWT
      const token = jwtUtils.generateToken(userId);
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        token
      });
      
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar usuario',
        error: error.message
      });
    }
  },
  
  // Iniciar sesión
  login: async (req, res) => {
    const { gmail, contraseña } = req.body;
    
    try {
      // Buscar usuario por email
      const [users] = await db.promise().query(
        'SELECT * FROM usuarios WHERE gmail = ?', 
        [gmail]
      );
      
      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
      
      const user = users[0];
      
      // Verificar contraseña
      const isMatch = await bcrypt.compare(contraseña, user.contraseña);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
      
      // Generar token JWT
      const token = jwtUtils.generateToken(user.id_usuario);
      
      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        token,
        user: user.id_usuario
      });
      
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión',
        error: error.message
      });
    }
  }
};

module.exports = authController;