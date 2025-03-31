const db = require('../config/firebase');

// Obtener todas las mascotas disponibles para adopción
const getAllPets = async () => {
    try {
        const petsSnapshot = await db.collection('pets').get();
        const pets = petsSnapshot.docs.map(doc => ({
            petId: doc.id,
            type: doc.data().type,
            specie: doc.data().specie,
            gender: doc.data().gender,
            size: doc.data().size,
            name: doc.data().name,
            age: doc.data().age,
            description: doc.data().description,
            photo: doc.data().photo
        }));
        return pets;
    } catch (error) {
        console.error('Error retrieving pets:', error);
        throw new Error('Error retrieving pets from database');
    }
};

// Obtener detalles de una mascota específica por ID
const getPetById = async (petId) => {
    try {
        const petDoc = await db.collection('pets').doc(petId).get();
        if (!petDoc.exists) {
            return null;
        }
        return {
            petId: petDoc.id,
            specie: petDoc.data().specie,
            gender: petDoc.data().gender,
            size: petDoc.data().size,
            name: petDoc.data().name,
            type: petDoc.data().type,
            age: petDoc.data().age,
            description: petDoc.data().description,
            photo: petDoc.data().photo
        };
    } catch (error) {
        console.error('Error retrieving pet details:', error);
        throw new Error('Error retrieving pet details from database');
    }
};

module.exports = {
    getAllPets,
    getPetById
};