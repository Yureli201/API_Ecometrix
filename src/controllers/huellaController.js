const db = require('../config/db');

const huellaDeCarbonoController = {
  // Calcular/actualizar huella de carbono
  calculate: async (req, res) => {
  const { id_usuario, mes_periodo, año_periodo } = req.body;

  try {
    // 1. Obtener datos de actividad agrupados por tipo de fuente
    const [actividades] = await db.promise().query(
      `SELECT id_tipo_fuente, SUM(cantidad) AS total_cantidad
       FROM datos_actividad
       WHERE id_usuario = ? AND mes_periodo = ? AND año_periodo = ?
       GROUP BY id_tipo_fuente`,
      [id_usuario, mes_periodo, año_periodo]
    );

    if (actividades.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron datos de actividad para el periodo'
      });
    }

    // 2. Obtener factores de emisión vigentes
    const [factores] = await db.promise().query(
      `SELECT id_tipo_fuente, factor
       FROM factores_emision_mx`,
    );

    // 3. Calcular huella total y desglose
    let totalHuella = 0;
    const desglose = [];
    const factoresMap = new Map(factores.map(f => [f.id_tipo_fuente, f.factor]));

    for (const actividad of actividades) {
      const factor = factoresMap.get(actividad.id_tipo_fuente);
      
      if (!factor) {
        console.warn(`Factor no encontrado para tipo_fuente: ${actividad.id_tipo_fuente}`);
        continue;
      }

      const huellaParcial = actividad.total_cantidad * factor;
      totalHuella += huellaParcial;

      desglose.push({
        id_tipo_fuente: actividad.id_tipo_fuente,
        total_cantidad: actividad.total_cantidad,
        factor: factor,
        huella_parcial: huellaParcial
      });
    }

    // 4. Guardar en base de datos
    const [result] = await db.promise().query(
      `INSERT INTO huella_carbono 
        (id_usuario, mes_periodo, año_periodo, total) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE
        total = VALUES(total)`,
      [id_usuario, mes_periodo, año_periodo, totalHuella]
    );

    res.status(200).json({
      success: true,
      total_huella: totalHuella,
      desglose: desglose,
      message: 'Huella calculada y guardada exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculando huella',
      error: error.message
    });
  }
},

  // Obtener histórico
  getHistory: async (req, res) => {
  const { id_usuario} = req.params;

  try {
    // 1. Obtener huella almacenada
    const [huella] = await db.promise().query(
      `SELECT * FROM huella_carbono
    WHERE id_usuario = ? ORDER BY año_periodo DESC, mes_periodo DESC`,
      [id_usuario]
    );

    if (huella.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huella no encontrada para el periodo especificado'
      });
    }


    res.status(200).json({
      success: true,
      huella: huella,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo huella',
      error: error.message
    });
  }
}
};

module.exports = huellaDeCarbonoController;