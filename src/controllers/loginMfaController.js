// src/controllers/loginMfaController.js
const loginMfaService = require('../services/loginMfaService');

/**
 * Verifica las credenciales y determina si es necesario MFA
 */
const verifyCredentials = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    const result = await loginMfaService.verifyCredentials(email, password);
    
    return res.status(200).json({
      userId: result.userId,
      hasMfa: result.hasMfa,
      message: result.hasMfa ? 'OTP verification ir required' : 'Successfull login'
    });
  } catch (error) {
    console.error('Credential verification error:', error);
    return res.status(401).json({ error: 'Incorrect credentials' });
  }
};

/**
 * Verifica el código OTP y completa el inicio de sesión
 */
const verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;
  
  if (!userId || !otp) {
    return res.status(400).json({ error: 'User id and OTP code are required' });
  }
  
  try {
    const userData = await loginMfaService.verifyOtpAndLogin(userId, otp);
    
    return res.status(200).json({
      message: 'Login exitoso',
      user: userData
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(401).json({ error: 'Invalid OTP code' });
  }
};

module.exports = {
  verifyCredentials,
  verifyOtp
};