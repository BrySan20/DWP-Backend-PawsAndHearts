// src/routes/loginMfaRoutes.js
const express = require('express');
const router = express.Router();
const loginMfaController = require('../controllers/loginMfaController');

// Ruta para verificar credenciales
router.post('/verify-credentials', loginMfaController.verifyCredentials);

// Ruta para verificar OTP y completar login
router.post('/verify-otp', loginMfaController.verifyOtp);

module.exports = router;