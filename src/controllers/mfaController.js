const mfaService = require('../services/mfaService');

// Generar el secreto MFA y QR para el registro
const generateMFASecret = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'El email es obligatorio' });
  }
  
  try {
    const secretData = mfaService.generateSecret(email);
    
    return res.status(200).json({ 
      qrCodeUrl: secretData.otpauth_url,
      secret: secretData.base32 // Ahora retornamos el secreto al cliente
    });
  } catch (error) {
    console.error('Error generando secreto MFA:', error);
    return res.status(500).json({ error: 'Error al generar secreto MFA' });
  }
};

// Completar el registro con MFA
const completeMFARegistration = async (req, res) => {
  const { email, fullName, password, mfaSecret } = req.body;
  
  if (!email || !fullName || !password || !mfaSecret) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios, incluyendo el secreto MFA' });
  }
  
  try {
    // Registrar usuario con MFA
    const user = await mfaService.registerUserWithMFA(email, fullName, password, mfaSecret);
    
    return res.status(201).json({ 
      message: 'Usuario registrado con éxito y MFA habilitado', 
      user 
    });
  } catch (error) {
    console.error('Error en registro MFA:', error);
    return res.status(500).json({ error: 'Error al completar el registro con MFA' });
  }
};

// Verificar OTP para el login
const verifyOTPLogin = async (req, res) => {
  const { email, password, otp } = req.body;
  
  if (!email || !password || !otp) {
    return res.status(400).json({ error: 'Email, contraseña y OTP son obligatorios' });
  }
  
  try {
    const userData = await mfaService.verifyLogin(email, password, otp);
    return res.status(200).json({ 
      message: 'Login exitoso', 
      user: userData 
    });
  } catch (error) {
    console.error('Error en verificación OTP:', error);
    return res.status(401).json({ error: 'Credenciales o código OTP incorrectos' });
  }
};

module.exports = {
  generateMFASecret,
  completeMFARegistration,
  verifyOTPLogin
};