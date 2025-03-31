const adopterService = require('../services/adopterService');

// Obtener todas las mascotas disponibles para adopción
const getAllPets = async (req, res) => {
  try {
    const pets = await adopterService.getAllPets();
    return res.status(200).json(pets);
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    return res.status(500).json({ error: 'Error al recuperar las mascotas' });
  }
};

// Obtener detalles de una mascota específica por ID
const getPetById = async (req, res) => {
  const { petId } = req.params;

  try {
    const pet = await adopterService.getPetById(petId);
    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }
    return res.status(200).json(pet);
  } catch (error) {
    console.error('Error al obtener detalles de la mascota:', error);
    return res.status(500).json({ error: 'Error al recuperar los detalles de la mascota' });
  }
};

module.exports = {
  getAllPets,
  getPetById
};