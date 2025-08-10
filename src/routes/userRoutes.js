const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// Proteger todas las rutas de usuario
router.use(authMiddleware.protect);

// Obtener datos del usuario
router.get('/profile', userController.getUser);

// Actualizar datos del usuario
router.put('/profile', userController.updateUser);

// Actualizar contraseña
router.put('/password', userController.updatePassword);

module.exports = router;