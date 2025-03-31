const db = require('../config/firebase');

// Add a pet to favorites
const addToFavorites = async (userId, petId) => {
    try {
        // Check if the favorite already exists
        const existingFavoriteQuery = await db.collection('favorites')
            .where('userId', '==', userId)
            .where('petId', '==', petId)
            .get();

        if (!existingFavoriteQuery.empty) {
            return { message: 'Pet already in favorites' };
        }

        // Add to favorites collection
        const favoriteDoc = {
            userId,
            petId,
            addedAt: new Date()
        };

        const docRef = await db.collection('favorites').add(favoriteDoc);
        
        return { 
            id: docRef.id, 
            ...favoriteDoc 
        };
    } catch (error) {
        console.error('Error adding to favorites:', error);
        throw new Error('Error adding pet to favorites');
    }
};

// Remove a pet from favorites
const removeFromFavorites = async (userId, petId) => {
    try {
        const querySnapshot = await db.collection('favorites')
            .where('userId', '==', userId)
            .where('petId', '==', petId)
            .get();

        if (querySnapshot.empty) {
            throw new Error('Favorite not found');
        }

        // Delete the first matching favorite (there should only be one)
        const docToDelete = querySnapshot.docs[0];
        await docToDelete.ref.delete();

        return { message: 'Pet removed from favorites' };
    } catch (error) {
        console.error('Error removing from favorites:', error);
        throw new Error('Error removing pet from favorites');
    }
};

// Get user's favorite pets
const getUserFavorites = async (userId) => {
    try {
        const favoritesSnapshot = await db.collection('favorites')
            .where('userId', '==', userId)
            .get();

        const favorites = await Promise.all(favoritesSnapshot.docs.map(async (doc) => {
            const favoriteData = doc.data();
            // Fetch pet details for each favorite
            const petDetails = await db.collection('pets').doc(favoriteData.petId).get();
            
            return {
                favoriteId: doc.id,
                ...favoriteData,
                petDetails: petDetails.exists ? petDetails.data() : null
            };
        }));

        return favorites;
    } catch (error) {
        console.error('Error retrieving favorites:', error);
        throw new Error('Error retrieving user favorites');
    }
};

// Check if a pet is in user's favorites
const isPetInFavorites = async (userId, petId) => {
    try {
        const querySnapshot = await db.collection('favorites')
            .where('userId', '==', userId)
            .where('petId', '==', petId)
            .get();

        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error checking favorites:', error);
        throw new Error('Error checking pet in favorites');
    }
};

module.exports = {
    addToFavorites,
    removeFromFavorites,
    getUserFavorites,
    isPetInFavorites
};