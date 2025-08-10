const db = require('../config/db');
const bcrypt = require('bcrypt');

const userController = {
  // Obtener información del usuario
  getUser: async (req, res) => {
    const userId = req.user.id; // Obtenido del token JWT
    console.log('Obteniendo usuario con ID:', userId);

    try {
      // Obtener todos los datos del usuario
      const [user] = await db.promise().query(
        `SELECT 
          id_usuario, 
          nombre_empresa, 
          gmail, 
          estado, 
          sector, 
          actividad_principal,
          num_empleados 
         FROM usuarios 
         WHERE id_usuario = ?`,
        [userId]
      );
      
      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: user[0]
      });
      
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener información del usuario',
        error: error.message
      });
    }
  },
  
  // Actualizar información del usuario
  updateUser: async (req, res) => {
    const userId = req.user.id;
    const { 
      nombre_empresa, 
      estado, 
      sector, 
      num_empleados,
      actividad_principal
    } = req.body;
    
    try {
      // Actualizar tabla usuarios
      await db.promise().query(
        `UPDATE usuarios 
         SET 
           nombre_empresa = ?, 
           estado = ?, 
           sector = ?,
           num_empleados = ?,
           actividad_principal = ?
         WHERE id_usuario = ?`,
        [nombre_empresa, estado, sector, num_empleados, actividad_principal, userId]
      );
      
      res.json({
        success: true,
        message: 'Datos actualizados exitosamente'
      });
      
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar los datos',
        error: error.message
      });
    }
  },
  
  // Actualizar contraseña (se mantiene igual)
  updatePassword: async (req, res) => {
    const userId = req.user.id;
    const { contraseñaActual, contraseñaNueva } = req.body;
    
    try {
      // Obtener contraseña actual del usuario
      const [users] = await db.promise().query(
        'SELECT contraseña FROM usuarios WHERE id_usuario = ?',
        [userId]
      );
      
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      const user = users[0];
      
      // Verificar contraseña actual
      const isMatch = await bcrypt.compare(contraseñaActual, user.contraseña);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'La contraseña actual es incorrecta'
        });
      }
      
      // Hashear nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(contraseñaNueva, salt);
      
      // Actualizar contraseña
      await db.promise().query(
        'UPDATE usuarios SET contraseña = ? WHERE id_usuario = ?',
        [hashedPassword, userId]
      );
      
      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
      
    } catch (error) {
      console.error('Error actualizando contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la contraseña',
        error: error.message
      });
    }
  }
};

module.exports = userController;