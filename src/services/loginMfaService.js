// src/services/loginMfaService.js
const speakeasy = require('speakeasy');
const db = require('../config/firebase');
const jwt = require('jsonwebtoken');

/**
 * Verifica las credenciales de usuario (email y password)
 */
const verifyCredentials = async (email, password) => {
  try {
    // Obtener usuario por email
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    
    if (userSnapshot.empty) {
      throw new Error('Usuario no encontrado');
    }
    
    const userData = userSnapshot.docs[0].data();
    const userId = userSnapshot.docs[0].id;
    
    // Verificar contraseña
    // Aquí podemos usar bcrypt para comparar la contraseña hasheada
    const isPasswordValid = await require('bcrypt').compare(password, userData.password);
    
    if (!isPasswordValid) {
      throw new Error('Contraseña incorrecta');
    }
    
    return {
      userId,
      userData,
      hasMfa: userData.mfaEnabled || false
    };
    
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Verifica el token OTP y completa el login
 */
const verifyOtpAndLogin = async (userId, otp) => {
  try {
    // Obtener usuario por ID
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new Error('Usuario no encontrado');
    }
    
    const userData = userDoc.data();
    
    // Verificar OTP
    const isOtpValid = speakeasy.totp.verify({
      secret: userData.mfaSecret,
      encoding: 'base32',
      token: otp
    });
    
    if (!isOtpValid) {
      throw new Error('Código OTP inválido');
    }
    
    // Actualizar último login
    await db.collection('users').doc(userId).update({
      last_login: new Date().toISOString()
    });
    
    // Generar token JWT
    const tokenPayload = {
      userId: userId,
      email: userData.email,
      role: userData.role,
      fullName: userData.fullName
    };
    
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'bryan20',
      { expiresIn: '10m' }
    );
    
    return {
      token,
      ...tokenPayload
    };
    
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  verifyCredentials,
  verifyOtpAndLogin
};