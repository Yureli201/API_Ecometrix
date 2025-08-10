const db = require('../config/db');

const ActividadController = {
  // -------------------------------
  // Registro y manejo de datos_actividad
  // -------------------------------
  
  addDataActividad: async (req, res) => {
    const { user_id } = req.params;
    const { id_tipo_fuente, mes_periodo, cantidad, costo_mxn, evidencia_url } = req.body;
    const mesFormateado = mes_periodo.length === 7 ? mes_periodo + '-01' : mes_periodo;

    try {
      const [result] = await db.promise().query(
        `INSERT INTO datos_actividad 
          (id_usuario, id_tipo_fuente, mes_periodo, cantidad, costo_mxn, evidencia_url) 
          VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, id_tipo_fuente, mesFormateado, cantidad, costo_mxn, evidencia_url || null]
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
    const { user_id, month } = req.params;
    const mesFormateado = month.length === 7 ? month + '-01' : month;

    try {
      const [rows] = await db.promise().query(
        'SELECT * FROM datos_actividad WHERE id_usuario = ? AND mes_periodo = ?',
        [user_id, mesFormateado]
      );

      res.json({
        success: true,
        data: rows
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
  },

  // -------------------------------
  // Sigueinte
  // -------------------------------
};

module.exports = ActividadController;
