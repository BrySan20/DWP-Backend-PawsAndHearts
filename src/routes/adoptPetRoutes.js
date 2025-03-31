const express = require('express');
const router = express.Router();
const adoptPetController = require('../controllers/adoptPetController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route to schedule an adoption (protected route)
router.post('/schedule', authMiddleware, adoptPetController.scheduleAdoption);

// Route to check adoption eligibility (protected route)
router.get('/eligibility/:petId', authMiddleware, adoptPetController.checkAdoptionEligibility);

// Route to cancel scheduled adoption (protected route)
router.delete('/cancel', authMiddleware, adoptPetController.cancelScheduledAdoption);

module.exports = router;