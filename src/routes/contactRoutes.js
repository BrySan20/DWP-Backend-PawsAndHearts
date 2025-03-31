const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/send-email', authMiddleware, contactController.sendEmailController);

module.exports = router;