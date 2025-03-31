const favoritesService = require('../services/favoritesService');

// Add a pet to favorites
const addToFavorites = async (req, res) => {
    const userId = req.userId; // Changed from req.user.userId
    const { petId } = req.body;

    try {
        const result = await favoritesService.addToFavorites(userId, petId);
        return res.status(201).json(result);
    } catch (error) {
        console.error('Error adding to favorites:', error);
        return res.status(500).json({ error: 'Error adding pet to favorites' });
    }
};

// Remove a pet from favorites
const removeFromFavorites = async (req, res) => {
    const userId = req.userId; // Changed from req.user.userId
    const { petId } = req.body;

    try {
        const result = await favoritesService.removeFromFavorites(userId, petId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error removing from favorites:', error);
        return res.status(500).json({ error: 'Error removing pet from favorites' });
    }
};

// Get user's favorite pets
const getUserFavorites = async (req, res) => {
    const userId = req.userId; // Changed from req.user.userId

    try {
        const favorites = await favoritesService.getUserFavorites(userId);
        return res.status(200).json(favorites);
    } catch (error) {
        console.error('Error retrieving favorites:', error);
        return res.status(500).json({ error: 'Error retrieving user favorites' });
    }
};

// Check if a pet is in user's favorites
const isPetInFavorites = async (req, res) => {
    const userId = req.userId; // Changed from req.user.userId
    const { petId } = req.params;

    try {
        const isInFavorites = await favoritesService.isPetInFavorites(userId, petId);
        return res.status(200).json({ isInFavorites });
    } catch (error) {
        console.error('Error checking favorites:', error);
        return res.status(500).json({ error: 'Error checking pet in favorites' });
    }
};

module.exports = {
    addToFavorites,
    removeFromFavorites,
    getUserFavorites,
    isPetInFavorites
};