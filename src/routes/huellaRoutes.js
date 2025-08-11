const express = require('express');
const router = express.Router();
const huellaController = require('../controllers/huellaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Proteger todas las rutas con autenticación JWT
router.use(authMiddleware.protect);

// Calcular huella de carbono para un mes específico
router.post('/calculate/:user_id/:month', huellaController.calculate);

// Obtener histórico de huella de carbono
router.get('/:user_id/history', huellaController.getHistory);

// Comparar huella actual con meses anteriores
router.get('/:user_id/compare', huellaController.getComparison);

module.exports = router;