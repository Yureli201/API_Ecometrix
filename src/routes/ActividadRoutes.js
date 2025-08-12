const express = require('express');
const router = express.Router();
const ActividadController = require('../controllers/ActividadController');

//
router.post('/actividad/:user_id', ActividadController.addDataActividad);
router.get('/actividad/:user_id/month/:month/age/:age', ActividadController.getDataActividadByMonth);
router.delete('/actividad/:activity_id', ActividadController.deleteDataActividad);


module.exports = router;
