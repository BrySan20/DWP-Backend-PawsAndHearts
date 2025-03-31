const db = require('../config/firebase');

const formatDate = (date) => {
  // Convertir la fecha a un formato más legible: YYYY-MM-DD HH:mm:ss
  const formattedDate = new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(',', '');

  return formattedDate;
};

const createScheduledAdoption = async (petData, userId, date) => {
  try {
    const petId = petData.petId || petData.id;

    // Check if user already has a scheduled adoption
    const userExistingAdoptionSnapshot = await db.collection('scheduledAdoptions')
      .where('userId', '==', userId)
      .get();
    
    if (!userExistingAdoptionSnapshot.empty) {
      throw new Error('You already have a pending adoption request');
    }

    // Check if the pet is already in the process of being adopted by another user
    const petAdoptionSnapshot = await db.collection('scheduledAdoptions')
      .where('petId', '==', petId)
      .get();
    
    if (!petAdoptionSnapshot.empty) {
      throw new Error('This pet is already in the process of being adopted');
    }

    // Formatear la fecha
    const formattedDate = formatDate(date);

    const scheduledAdoptionRef = await db.collection('scheduledAdoptions').add({
      petId: petId,
      userId: userId,
      age: petData.age,
      description: petData.description,
      gender: petData.gender,
      name: petData.name,
      photo: petData.photo,
      size: petData.size,
      specie: petData.specie,
      type: petData.type,
      status: 'pending',
      date: formattedDate, // Fecha formateada
      originalDate: date, // Mantener la fecha original si es necesario
      createdAt: new Date().toISOString()
    });

    return {
      id: scheduledAdoptionRef.id,
      ...petData,
      status: 'pending',
      date: formattedDate
    };
  } catch (error) {
    console.error('Error creating scheduled adoption:', error);
    throw error;
  }
};

const checkAdoptionEligibility = async (petId, userId) => {
  try {
    // Check if user already has a scheduled adoption
    const userExistingAdoptionSnapshot = await db.collection('scheduledAdoptions')
      .where('userId', '==', userId)
      .get();
    
    if (!userExistingAdoptionSnapshot.empty) {
      return {
        allowed: false,
        reason: 'user_has_pending_adoption'
      };
    }

    // Check if the pet is already in the process of being adopted
    const petAdoptionSnapshot = await db.collection('scheduledAdoptions')
      .where('petId', '==', petId)
      .get();
    
    if (!petAdoptionSnapshot.empty) {
      const adoptionDoc = petAdoptionSnapshot.docs[0].data();
      return {
        allowed: false,
        reason: adoptionDoc.userId === userId 
          ? 'user_has_pending_adoption' 
          : 'pet_in_adoption_process'
      };
    }

    return {
      allowed: true
    };
  } catch (error) {
    console.error('Error checking adoption eligibility:', error);
    throw error;
  }
};

const cancelScheduledAdoption = async (userId) => {
  try {
    const snapshot = await db.collection('scheduledAdoptions')
      .where('userId', '==', userId)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error canceling scheduled adoption:', error);
    throw error;
  }
};

module.exports = {
  createScheduledAdoption,
  checkAdoptionEligibility,
  cancelScheduledAdoption
};