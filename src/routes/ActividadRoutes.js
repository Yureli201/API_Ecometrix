const express = require('express');
const router = express.Router();
const ActividadController = require('../controllers/ActividadController');

// -------------------------------
// Rutas para datos_actividad
// -------------------------------
router.post('/actividad/:user_id', ActividadController.addDataActividad);
router.get('/actividad/:user_id/month/:month', ActividadController.getDataActividadByMonth);
router.delete('/actividad/:activity_id', ActividadController.deleteDataActividad);

// -------------------------------
// sigueinte
// -------------------------------

module.exports = router;
