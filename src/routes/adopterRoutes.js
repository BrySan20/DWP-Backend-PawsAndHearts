const express = require('express');
const router = express.Router();
const adopterController = require('../controllers/adopterController');
const authMiddleware = require('../middlewares/authMiddleware');

// Ruta para obtener todas las mascotas (requiere autenticación)
router.get('/', authMiddleware, adopterController.getAllPets);

// Ruta para obtener detalles de una mascota específica (requiere autenticación)
router.get('/:petId', authMiddleware, adopterController.getPetById);


module.exports = router;