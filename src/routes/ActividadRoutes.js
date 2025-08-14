const express = require('express');
const router = express.Router();
const ActividadController = require('../controllers/ActividadController');

//añadir nueva actividad
router.post('/actividad/:user_id', ActividadController.addDataActividad);
// Obtener todas las actividades de un usuario
router.get('/actividad/:user_id/month/:month/age/:age', ActividadController.getDataActividadByMonth);
// Borrar una actividad específica
router.delete('/actividad/:activity_id', ActividadController.deleteDataActividad);


module.exports = router;
