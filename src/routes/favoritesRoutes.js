const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const authMiddleware = require('../middlewares/authMiddleware');

// Add a pet to favorites (requires authentication)
router.post('/', authMiddleware, favoritesController.addToFavorites);

// Remove a pet from favorites (requires authentication)
router.delete('/', authMiddleware, favoritesController.removeFromFavorites);

// Get user's favorite pets (requires authentication)
router.get('/', authMiddleware, favoritesController.getUserFavorites);

// Check if a specific pet is in user's favorites (requires authentication)
router.get('/:petId/check', authMiddleware, favoritesController.isPetInFavorites);

module.exports = router;