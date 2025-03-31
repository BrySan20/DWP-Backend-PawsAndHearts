const adoptPetService = require('../services/adoptPetService');

const scheduleAdoption = async (req, res) => {
  try {
    const { pet, date } = req.body;
    const userId = req.userId; // From auth middleware

    if (!pet) {
      return res.status(400).json({ error: 'Pet details are required' });
    }

    const scheduledAdoption = await adoptPetService.createScheduledAdoption(pet, userId, date);

    return res.status(201).json({
      message: 'Adoption scheduled successfully',
      scheduledAdoption
    });
  } catch (error) {
    console.error('Error scheduling adoption:', error);
    return res.status(400).json({ error: error.message });
  }
};

const checkAdoptionEligibility = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.userId; // From auth middleware

    const eligibility = await adoptPetService.checkAdoptionEligibility(petId, userId);

    return res.status(200).json(eligibility);
  } catch (error) {
    console.error('Error checking adoption eligibility:', error);
    return res.status(500).json({ error: 'Failed to check adoption eligibility' });
  }
};

const cancelScheduledAdoption = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    await adoptPetService.cancelScheduledAdoption(userId);

    return res.status(200).json({ message: 'Scheduled adoption canceled successfully' });
  } catch (error) {
    console.error('Error canceling scheduled adoption:', error);
    return res.status(500).json({ error: 'Failed to cancel scheduled adoption' });
  }
};

module.exports = {
  scheduleAdoption,
  checkAdoptionEligibility,
  cancelScheduledAdoption
};