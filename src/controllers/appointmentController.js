const appointmentService = require('../services/appointmentService');

const getScheduledAdoptions = async (req, res) => {
  try {
    const scheduledAdoptions = await appointmentService.getScheduledAdoptions();
    return res.status(200).json(scheduledAdoptions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error fetching scheduled adoptions' });
  }
};

const processAdoptionRequest = async (req, res) => {
  const { adoptionId } = req.params;
  const { status } = req.body;

  if (!adoptionId || !status) {
    return res.status(400).json({ error: 'Missing adoption ID or status' });
  }

  try {
    const result = await appointmentService.processAdoptionRequest(adoptionId, status);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error processing adoption request' });
  }
};

module.exports = {
  getScheduledAdoptions,
  processAdoptionRequest
};