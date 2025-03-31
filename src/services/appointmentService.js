const db = require('../config/firebase');
const admin = require('firebase-admin');
const { getUserById } = require('./authService');

const getScheduledAdoptions = async () => {
  try {
    const scheduledSnapshot = await db.collection('scheduledAdoptions').get();
    const scheduledAdoptions = [];

    for (let doc of scheduledSnapshot.docs) {
      const adoptionData = { id: doc.id, ...doc.data() };
      
      // Fetch user details for the adopter
      if (adoptionData.userId) {
        const userData = await getUserById(adoptionData.userId);
        adoptionData.adopter = userData ? userData.fullName : 'Unknown';
      }

      scheduledAdoptions.push(adoptionData);
    }

    return scheduledAdoptions;
  } catch (error) {
    console.error('Error fetching scheduled adoptions:', error);
    throw new Error('Could not fetch scheduled adoptions');
  }
};

const processAdoptionRequest = async (adoptionId, status) => {
  const db = admin.firestore();
  const batch = db.batch();

  try {
    const adoptionRef = db.collection('scheduledAdoptions').doc(adoptionId);
    const adoptionSnapshot = await adoptionRef.get();
    
    if (!adoptionSnapshot.exists) {
      throw new Error('Adoption request not found');
    }

    const adoptionData = adoptionSnapshot.data();

    if (status === 'approved') {
      // Create a new document in finalizedAdoptions
      const finalizedAdoptionsRef = db.collection('finalizedAdoptions').doc();
      batch.set(finalizedAdoptionsRef, {
        ...adoptionData,
        approvedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Delete the pet from pets collection
      const petRef = db.collection('pets').doc(adoptionData.petId);
      batch.delete(petRef);
    }

    // Always delete the scheduled adoption
    batch.delete(adoptionRef);

    // Commit the batch
    await batch.commit();

    return { success: true, status };
  } catch (error) {
    console.error('Error processing adoption request:', error);
    throw new Error('Could not process adoption request');
  }
};

module.exports = {
  getScheduledAdoptions,
  processAdoptionRequest
};