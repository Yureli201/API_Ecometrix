const huellaService = require('../services/huellaService');
const authMiddleware = require('../middlewares/authMiddleware');

const huellaDeCarbonoController = {
  // Calcular huella de carbono
  calculate: async (req, res) => {
    try {
      const { user_id, month } = req.params;
      
      // Verificar que el usuario autenticado coincide con el user_id
      if (req.user.id !== parseInt(user_id)) {
        return res.status(403).json({
          success: false,
          message: 'No autorizado para realizar esta acción'
        });
      }

      const result = await huellaService.calculateFootprint(user_id, month);
      
      res.json({
        success: true,
        message: 'Huella de carbono calculada exitosamente',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al calcular huella de carbono',
        error: error.message
      });
    }
  },

  // Obtener histórico
  getHistory: async (req, res) => {
    try {
      const { user_id } = req.params;
      
      if (req.user.id !== parseInt(user_id)) {
        return res.status(403).json({
          success: false,
          message: 'No autorizado para realizar esta acción'
        });
      }

      const history = await huellaService.getHistory(user_id);
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener histórico',
        error: error.message
      });
    }
  },

  // Comparar huella
  getComparison: async (req, res) => {
    try {
      const { user_id } = req.params;
      
      if (req.user.id !== parseInt(user_id)) {
        return res.status(403).json({
          success: false,
          message: 'No autorizado para realizar esta acción'
        });
      }

      const comparisonData = await huellaService.getComparison(user_id);
      
      res.json({
        success: true,
        data: comparisonData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener datos de comparación',
        error: error.message
      });
    }
  }
};

module.exports = huellaDeCarbonoController;