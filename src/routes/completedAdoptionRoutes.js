const express = require('express');
const router = express.Router();
const completedAdoptionController = require('../controllers/completedAdoptionController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, completedAdoptionController.getCompletedAdoptions);

module.exports = router;