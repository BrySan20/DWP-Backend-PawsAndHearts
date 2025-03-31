const db = require('../config/firebase');

// Get all pets
const getAllPets = async () => {
  try {
    const petsSnapshot = await db.collection('pets').get();
    const pets = [];
    
    petsSnapshot.forEach(doc => {
      pets.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return pets;
  } catch (error) {
    console.error('Error fetching pets from Firestore:', error);
    throw new Error('Error al obtener mascotas');
  }
};

// Get pet by ID
const getPetById = async (petId) => {
  try {
    const petDoc = await db.collection('pets').doc(petId).get();
    
    if (!petDoc.exists) {
      return null;
    }
    
    return {
      id: petDoc.id,
      ...petDoc.data()
    };
  } catch (error) {
    console.error('Error fetching pet from Firestore:', error);
    throw new Error('Error al obtener mascota');
  }
};

// Create a new pet
const createPet = async (petData) => {
  try {
    const petRef = await db.collection('pets').add({
      ...petData,
      createdAt: new Date().toISOString()
    });
    
    const newPetDoc = await petRef.get();
    return {
      id: newPetDoc.id,
      ...newPetDoc.data()
    };
  } catch (error) {
    console.error('Error creating pet in Firestore:', error);
    throw new Error('Error al crear mascota');
  }
};

// Update a pet
const updatePet = async (petId, petData) => {
  try {
    await db.collection('pets').doc(petId).update({
      ...petData,
      updatedAt: new Date().toISOString()
    });
    
    const updatedPetDoc = await db.collection('pets').doc(petId).get();
    return {
      id: updatedPetDoc.id,
      ...updatedPetDoc.data()
    };
  } catch (error) {
    console.error('Error updating pet in Firestore:', error);
    throw new Error('Error al actualizar mascota');
  }
};

// Delete a pet
const deletePet = async (petId) => {
  try {
    await db.collection('pets').doc(petId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting pet from Firestore:', error);
    throw new Error('Error al eliminar mascota');
  }
};

module.exports = {
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet
};