const resetPassService = require('../services/resetPassService');

// Verificar si el correo existe
const verifyEmail = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    const exists = await resetPassService.verifyEmail(email);
    return res.status(200).json({ exists });
  } catch (error) {
    console.error('Error verificando email:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Enviar código de restablecimiento
const sendResetCode = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    const result = await resetPassService.sendResetCode(email);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error sending code:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Verificar código de restablecimiento
const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;
  
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }
  
  try {
    const result = await resetPassService.verifyResetCode(email, code);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error verifying code:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Restablecer contraseña
const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    const result = await resetPassService.resetPassword(email, code, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  verifyEmail,
  sendResetCode,
  verifyResetCode,
  resetPassword
};