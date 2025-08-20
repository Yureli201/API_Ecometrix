const predictionService = require('../services/prediction');
const authMiddleware = require('../middlewares/authMiddleware');

const predictionController = {
  // Generar/actualizar nueva predicción
  generatePrediction: async (req, res) => {
    try {
      const { user_id } = req.params;
      
      /* Verificar que el usuario autenticado coincide con el user_id
      if (req.user.id !== parseInt(user_id)) {
        return res.status(403).json({
          success: false,
          message: 'No autorizado para realizar esta acción'
        });
      }*/

      const prediction = await predictionService.generatePrediction(user_id);
      
      res.json({
        success: true,
        message: 'Predicción generada exitosamente',
        data: prediction
      });
    } catch (error) {
      const status = error.message.includes('al menos 3 meses') ? 400 : 500;
      res.status(status).json({
        success: false,
        message: 'Error al generar predicción',
        error: error.message
      });
    }
  },

  // Obtener predicciones de un usuario
  getPredictions: async (req, res) => {
    try {
      const { user_id } = req.params;
      
      /*if (req.user.id !== parseInt(user_id)) {
        return res.status(403).json({
          success: false,
          message: 'No autorizado para realizar esta acción'
        });
      }*/

      const predictions = await predictionService.getUserPredictions(user_id);
      
      res.json({
        success: true,
        data: predictions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener predicciones',
        error: error.message
      });
    }
  }
};

module.exports = predictionController;