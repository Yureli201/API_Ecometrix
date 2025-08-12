const db = require('../config/db');

const ActividadController = {

  addDataActividad: async (req, res) => {
    const { user_id } = req.params;
    const { id_tipo_fuente, mes_periodo,año_periodo, cantidad, costo_mxn, evidencia_url } = req.body;

    try {
      const [result] = await db.promise().query(
        `INSERT INTO datos_actividad 
          (id_usuario, id_tipo_fuente, mes_periodo, año_periodo, cantidad, costo_mxn, evidencia_url) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user_id, id_tipo_fuente, mes_periodo, año_periodo, cantidad, costo_mxn, evidencia_url || null]
      );

      res.status(201).json({
        success: true,
        message: 'Dato registrado exitosamente',
        id_actividad: result.insertId
      });
    } catch (error) {
      console.error('Error agregando dato:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar dato',
        error: error.message
      });
    }
  },

  getDataActividadByMonth: async (req, res) => {
    const { user_id, month, age } = req.params;

    try {
      const [rows] = await db.promise().query(
        'SELECT * FROM datos_actividad WHERE id_usuario = ? AND mes_periodo = ? AND año_periodo = ?',
        [user_id, month, age]
      );
      const [resume] = await db.promise().query(
        `SELECT SUM(cantidad) AS total_cantidad, SUM(costo_mxn) AS total_costo, id_tipo_fuente FROM datos_actividad 
         WHERE id_usuario = ? AND mes_periodo = ? AND año_periodo = ? GROUP BY id_tipo_fuente`,
        [user_id, month, age]
      );

      res.json({
        success: true,
        data: rows,
        resume: resume
      });
    } catch (error) {
      console.error('Error obteniendo datos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener datos',
        error: error.message
      });
    }
  },

  deleteDataActividad: async (req, res) => {
    const { activity_id } = req.params;

    try {
      const [result] = await db.promise().query(
        'DELETE FROM datos_actividad WHERE id_actividad = ?',
        [activity_id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Registro no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Registro eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando dato:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar registro',
        error: error.message
      });
    }
  }
};

module.exports = ActividadController;
