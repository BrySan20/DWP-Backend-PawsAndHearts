const db = require('../config/firebase');
const authService = require('./authService');

const getCompletedAdoptions = async () => {
  try {
    // Fetch all completed adoptions
    const completedAdoptionsSnapshot = await db.collection('finalizedAdoptions').get();
    
    // Create an array to store the completed adoptions with user details
    const completedAdoptions = [];

    // Iterate through completed adoptions and fetch user details
    for (const doc of completedAdoptionsSnapshot.docs) {
      const adoptionData = doc.data();
      
      // Fetch user details using userId
      const user = await authService.getUserById(adoptionData.userId);
      
      completedAdoptions.push({
        id: doc.id,
        ...adoptionData,
        adopter: user ? user.fullName : 'Unknown Adopter'
      });
    }

    return completedAdoptions;
  } catch (error) {
    console.error('Error fetching completed adoptions:', error);
    throw new Error('Unable to fetch completed adoptions');
  }
};

module.exports = {
  getCompletedAdoptions
};