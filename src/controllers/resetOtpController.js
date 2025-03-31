const resetOtpService = require('../services/resetOtpService');

// Solicitar código de reinicio
const requestResetCode = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email si required' });
  }
  
  try {
    const result = await resetOtpService.generateResetCode(email);
    return res.status(200).json({ 
      message: 'Verification code sent to email',
      userId: result.userId
    });
  } catch (error) {
    console.error('Error requesting reset code:', error);
    return res.status(400).json({ error: error.message });
  }
};

// Verificar código de reinicio
const verifyResetCode = async (req, res) => {
  const { userId, code } = req.body;
  
  if (!userId || !code) {
    return res.status(400).json({ error: 'UserId and code are required' });
  }
  
  try {
    const result = await resetOtpService.verifyResetCode(userId, code);
    return res.status(200).json({ 
      message: 'Code verified successfully',
      email: result.email
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    return res.status(400).json({ error: error.message });
  }
};

// Regenerar secreto OTP
const regenerateOtpSecret = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    const secretData = await resetOtpService.regenerateOtpSecret(email);
    return res.status(200).json({ 
      message: 'OTP secret regenerated successfully',
      qrCodeUrl: secretData.otpauth_url,
      secret: secretData.base32
    });
  } catch (error) {
    console.error('Error regenerating otp secret:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  requestResetCode,
  verifyResetCode,
  regenerateOtpSecret
};