const express = require('express');
const router = express.Router();
const userFavoritesController = require('../controllers/userFavoritesController');
const authMiddleware = require('../middlewares/authMiddleware');

// Ruta para obtener mascotas favoritas del usuario autenticado
router.get('/my-favorites', authMiddleware, userFavoritesController.getUserFavorites);

module.exports = router;