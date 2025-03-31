const express = require('express');
const router = express.Router();
const resetOtpController = require('../controllers/resetOtpController');

// Ruta para solicitar código de reinicio
router.post('/request-code', resetOtpController.requestResetCode);

// Ruta para verificar código de reinicio
router.post('/verify-code', resetOtpController.verifyResetCode);

// Ruta para regenerar secreto OTP
router.post('/regenerate-secret', resetOtpController.regenerateOtpSecret);

module.exports = router;