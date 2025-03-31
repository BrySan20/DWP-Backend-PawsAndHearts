const db = require('../config/firebase');

// Obtener mascotas favoritas de un usuario específico
const getUserFavorites = async (userId) => {
  try {
    // Primero, obtenemos los IDs de favoritos del usuario
    const favoritesSnapshot = await db.collection('favorites')
      .where('userId', '==', userId)
      .get();

    // Si no hay favoritos, retornar un array vacío
    if (favoritesSnapshot.empty) {
      return [];
    }

    // Extraer los petIds de los favoritos
    const petIds = favoritesSnapshot.docs.map(doc => doc.data().petId);

    // Buscar las mascotas con esos IDs
    const petsPromises = petIds.map(async (petId) => {
      const petDoc = await db.collection('pets').doc(petId).get();
      return petDoc.exists ? { id: petDoc.id, ...petDoc.data() } : null;
    });

    // Resolver todas las promesas y filtrar cualquier resultado nulo
    const pets = await Promise.all(petsPromises);
    return pets.filter(pet => pet !== null);
  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    throw new Error('No se pudieron obtener los favoritos');
  }
};

module.exports = {
  getUserFavorites
};