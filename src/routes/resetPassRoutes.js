const express = require('express');
const router = express.Router();
const resetPassController = require('../controllers/resetPassController');

// Verificar si el correo existe
router.post('/verify-email', resetPassController.verifyEmail);

// Enviar código de restablecimiento
router.post('/send-code', resetPassController.sendResetCode);

// Verificar código de restablecimiento
router.post('/verify-code', resetPassController.verifyResetCode);

// Restablecer contraseña
router.post('/reset-password', resetPassController.resetPassword);

module.exports = router;