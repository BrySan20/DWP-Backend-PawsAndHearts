const userFavoritesService = require('../services/userFavoritesService');

const getUserFavorites = async (req, res) => {
  try {
    const userId = req.userId; // Obtenido del middleware de autenticación

    // Obtener mascotas favoritas del usuario
    const favorites = await userFavoritesService.getUserFavorites(userId);

    return res.status(200).json(favorites);
  } catch (error) {
    console.error('Error en el controlador de favoritos:', error);
    return res.status(500).json({ 
      error: 'No se pudieron obtener los favoritos', 
      details: error.message 
    });
  }
};

module.exports = {
  getUserFavorites
};