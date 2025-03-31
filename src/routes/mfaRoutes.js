const express = require('express');
const router = express.Router();
const mfaController = require('../controllers/mfaController');

// Ruta para generar secreto MFA y QR
router.post('/generate-secret', mfaController.generateMFASecret);

// Ruta para completar el registro con MFA
router.post('/complete-registration', mfaController.completeMFARegistration);

// Ruta para verificar OTP en el login
router.post('/verify-otp', mfaController.verifyOTPLogin);

module.exports = router;