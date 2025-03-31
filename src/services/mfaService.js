const speakeasy = require('speakeasy');
const db = require('../config/firebase');
const authService = require('./authService');

/**
 * Genera un secreto para OTP
 */
const generateSecret = (email) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `PawsAndHearts: ${email}`
    });
    
    return {
      otpauth_url: secret.otpauth_url,
      base32: secret.base32
    };
  } catch (error) {
    throw new Error(`Error generating MFA secret: ${error.message}`);
  }
};

/**
 * Verifica el token OTP proporcionado
 */
const verifyOTP = (token, secret) => {
  try {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token
    });
  } catch (error) {
    throw new Error(`Error verifying OTP: ${error.message}`);
  }
};

/**
 * Registra un usuario con MFA
 */
const registerUserWithMFA = async (email, fullName, password, mfaSecret) => {
  try {
    // Registrar usuario normalmente
    const user = await authService.registerUser(email, fullName, password);
    
    // Añadir secreto MFA al usuario
    await db.collection('users').doc(user.id).update({
      mfaEnabled: true,
      mfaSecret: mfaSecret
    });
    
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Verifica las credenciales y el OTP para el inicio de sesión
 */
const verifyLogin = async (email, password, token) => {
  try {
    // Obtener usuario
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      throw new Error('Usuario no encontrado');
    }
    
    const userData = userSnapshot.docs[0].data();
    const userId = userSnapshot.docs[0].id;
    
    // Si el usuario no tiene MFA habilitado, usar flujo normal
    if (!userData.mfaEnabled) {
      return await authService.loginUser(email, password);
    }
    
    // Verificar contraseña
    const passwordValid = await authService.verifyPassword(email, password);
    if (!passwordValid) {
      throw new Error('Contraseña incorrecta');
    }
    
    // Verificar token OTP
    const otpValid = verifyOTP(token, userData.mfaSecret);
    if (!otpValid) {
      throw new Error('Código OTP inválido');
    }
    
    // Actualizar último login
    await db.collection('users').doc(userId).update({
      last_login: new Date().toISOString(),
    });
    
    // Generar token JWT y devolver datos
    const tokenPayload = { 
      userId: userId, 
      email: userData.email,
      role: userData.role, 
      fullName: userData.fullName
    };
    
    const jwtToken = require('jsonwebtoken').sign(
      tokenPayload, 
      process.env.JWT_SECRET || 'bryan20', 
      { expiresIn: '10m' }
    );
    
    return { 
      token: jwtToken, 
      ...tokenPayload
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  generateSecret,
  verifyOTP,
  registerUserWithMFA,
  verifyLogin
};