const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/firebase');

const JWT_SECRET_KEY = process.env.JWT_SECRET || 'bryan20';

const registerUser = async (email, fullName, password) => {
  try {
    const emailSnapshot = await db.collection('users').where('email', '==', email).get();
    if (!emailSnapshot.empty) {
      throw new Error('Este correo electrónico ya está en uso');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newUser = {
      email,
      fullName,
      password: hashedPassword,
      last_login: null,
      role: 'adopter',
    };

    const userRef = await db.collection('users').add(newUser);
    const userDoc = await userRef.get();
    
    return { id: userDoc.id, email, fullName };
  } catch (error) {
    throw new Error(error.message);
  }
};

const loginUser = async (email, password) => {
  try {
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      throw new Error('Usuario no encontrado');
    }
    
    const user = userSnapshot.docs[0].data();

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Contraseña incorrecta');
    }
    
    await db.collection('users').doc(userSnapshot.docs[0].id).update({
      last_login: new Date().toISOString(),
    });

    const tokenPayload = { 
      userId: userSnapshot.docs[0].id, 
      email: user.email,
      role: user.role, 
      fullName: user.fullName
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET_KEY, { expiresIn: '10m' });

    return { 
      token, 
      ...tokenPayload
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Obtener usuario por ID
const getUserById = async (userId) => {
  try {
    const userRef = await db.collection('users').doc(userId).get();
    if (!userRef.exists) return null;
    return userRef.data();
  } catch (error) {
    throw new Error('Error al obtener usuario');
  }
};

// Verify current password
const verifyCurrentPassword = async (userId, currentPassword) => {
  try {
    const userRef = await db.collection('users').doc(userId).get();
    if (!userRef.exists) return false;
    
    const user = userRef.data();
    return await bcrypt.compare(currentPassword, user.password);
  } catch (error) {
    throw new Error(`Error verifying password: ${error.message}`);
  }
};

// Update user password
const updateUserPassword = async (userId, newPassword) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    await db.collection('users').doc(userId).update({
      password: hashedPassword
    });
    
    return true;
  } catch (error) {
    throw new Error(`Error updating password: ${error.message}`);
  }
};

// Verificar contraseña sin generar token
const verifyPassword = async (email, password) => {
  try {
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return false;
    }
    
    const user = userSnapshot.docs[0].data();
    return await bcrypt.compare(password, user.password);
  } catch (error) {
    throw new Error(`Error verifying password: ${error.message}`);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  verifyCurrentPassword,
  updateUserPassword,
  verifyPassword,
};
