const express = require('express');
const router = express.Router();
const huellaController = require('../controllers/huellaController');

// Calcular huella de carbono para un mes específico
router.post('/calculate', huellaController.calculate);

// Obtener histórico
router.get('/history/:id_usuario', huellaController.getHistory);

module.exports = router;