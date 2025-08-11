const db = require('../config/db');

const huellaDeCarbonoService = {
  // Calcular huella de carbono para un mes específico
  calculateFootprint: async (userId, month) => {
    try {
      // Obtener todos los datos de actividad para el usuario y mes específico
      const [activities] = await db.promise().query(
        `SELECT da.*, tf.alcance, fem.factor 
         FROM datos_actividad da
         JOIN tipo_fuente tf ON da.id_tipo_fuente = tf.id_tipo_fuente
         JOIN factores_emision_mx fem ON da.id_tipo_fuente = fem.id_tipo_fuente
         WHERE da.id_usuario = ? AND da.mes_periodo = ?`,
        [userId, `${month}-01`] // Formato YYYY-MM-DD
      );

      if (activities.length === 0) {
        throw new Error('No hay datos de actividad para el mes especificado');
      }

      // Inicializar acumuladores por alcance
      const footprint = {
        alcance1: 0,
        alcance2: 0,
        alcance3: 0,
        total: 0
      };

      // Calcular emisiones por cada actividad
      activities.forEach(activity => {
        const emissions = activity.cantidad * activity.factor;
        
        switch (activity.alcance) {
          case 1:
            footprint.alcance1 += emissions;
            break;
          case 2:
            footprint.alcance2 += emissions;
            break;
          case 3:
            footprint.alcance3 += emissions;
            break;
        }
      });

      // Calcular total
      footprint.total = footprint.alcance1 + footprint.alcance2 + footprint.alcance3;

      // Obtener facturación anual para calcular intensidad
      const [empresa] = await db.promise().query(
        'SELECT facturacion_anual FROM empresa_detalles WHERE id_usuario = ?',
        [userId]
      );

      const facturacionAnual = empresa[0]?.facturacion_anual || 0;
      const intensidad = facturacionAnual > 0 
        ? (footprint.total / (facturacionAnual / 1000)).toFixed(2) 
        : 0;

      // Guardar el cálculo en la base de datos
      const [result] = await db.promise().query(
        `INSERT INTO huella_carbono 
         (id_usuario, mes_periodo, alcance1, alcance2, alcance3, total, intensidad)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         alcance1 = VALUES(alcance1),
         alcance2 = VALUES(alcance2),
         alcance3 = VALUES(alcance3),
         total = VALUES(total),
         intensidad = VALUES(intensidad)`,
        [
          userId,
          `${month}-01`,
          footprint.alcance1,
          footprint.alcance2,
          footprint.alcance3,
          footprint.total,
          intensidad
        ]
      );

      return {
        ...footprint,
        intensidad,
        id_huella: result.insertId || null
      };

    } catch (error) {
      console.error('Error en calculateFootprint:', error);
      throw error;
    }
  },

  // Obtener histórico de huella de carbono
  getHistory: async (userId) => {
    try {
      const [history] = await db.promise().query(
        `SELECT 
          id_huella,
          mes_periodo,
          alcance1,
          alcance2,
          alcance3,
          total,
          intensidad
         FROM huella_carbono
         WHERE id_usuario = ?
         ORDER BY mes_periodo DESC`,
        [userId]
      );

      return history;
    } catch (error) {
      console.error('Error en getHistory:', error);
      throw error;
    }
  },

  // Comparar huella actual con meses anteriores
  getComparison: async (userId) => {
    try {
      // Obtener los últimos 12 meses de datos
      const [data] = await db.promise().query(
        `SELECT 
          mes_periodo,
          total,
          alcance1,
          alcance2,
          alcance3,
          intensidad
         FROM huella_carbono
         WHERE id_usuario = ?
         ORDER BY mes_periodo DESC
         LIMIT 12`,
        [userId]
      );

      if (data.length === 0) {
        return { comparison: [], averages: null };
      }

      // Calcular promedios
      const averages = {
        total: data.reduce((sum, item) => sum + item.total, 0) / data.length,
        alcance1: data.reduce((sum, item) => sum + item.alcance1, 0) / data.length,
        alcance2: data.reduce((sum, item) => sum + item.alcance2, 0) / data.length,
        alcance3: data.reduce((sum, item) => sum + item.alcance3, 0) / data.length,
        intensidad: data.reduce((sum, item) => sum + parseFloat(item.intensidad), 0) / data.length
      };

      return {
        comparison: data,
        averages
      };
    } catch (error) {
      console.error('Error en getComparison:', error);
      throw error;
    }
  }
};

module.exports = huellaDeCarbonoService;