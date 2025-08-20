const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const authMiddleware = require('../middlewares/authMiddleware');

/* Proteger todas las rutas con autenticación JWT
router.use(authMiddleware.protect);
*/

// Generar nueva predicción
router.get('/:user_id', predictionController.generatePrediction);

// Obtener todas las predicciones de un usuario
router.get('/obtener/:user_id', predictionController.getPredictions);

module.exports = router;
