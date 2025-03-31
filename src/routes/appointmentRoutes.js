const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Get all scheduled adoptions (admin only)
router.get('/scheduled', authMiddleware, appointmentController.getScheduledAdoptions);

// Process adoption request (approve/reject)
router.put('/process/:adoptionId', authMiddleware, appointmentController.processAdoptionRequest);

module.exports = router;