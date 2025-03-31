const completedAdoptionService = require('../services/completedAdoptionService');

const getCompletedAdoptions = async (req, res) => {
  try {
    const completedAdoptions = await completedAdoptionService.getCompletedAdoptions();
    return res.status(200).json(completedAdoptions);
  } catch (error) {
    console.error('Error in getCompletedAdoptions:', error);
    return res.status(500).json({ error: 'Unable to retrieve completed adoptions' });
  }
};

module.exports = {
  getCompletedAdoptions
};