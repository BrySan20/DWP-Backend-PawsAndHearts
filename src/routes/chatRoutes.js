// Modificación para DWP-Backend-PawsAndHearts/src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

// Obtener historial de chat
router.get('/history', authMiddleware, chatController.getChatHistory);

module.exports = router;