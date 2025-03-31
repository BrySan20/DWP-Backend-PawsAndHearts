const db = require('../config/firebase');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  service: 'gmail',
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// Verificar si el correo existe en la base de datos
const verifyEmail = async (email) => {
  try {
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    return !userSnapshot.empty;
  } catch (error) {
    throw new Error(`Error verificando email: ${error.message}`);
  }
};

// Generar código de restablecimiento y enviarlo por correo
const sendResetCode = async (email) => {
  try {
    // Verificar si el usuario existe
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      throw new Error('Usuario no encontrado');
    }

    // Generar código aleatorio de 6 dígitos
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const userId = userSnapshot.docs[0].id;

    // Guardar código en la base de datos con expiración (5 minutos)
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 5);

    await db.collection('resetCodes').doc(userId).set({
      code: resetCode,
      email,
      expiresAt: expirationTime.toISOString(),
      used: false
    });

    // Enviar correo con el código
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Code - Paws And Hearts',
      html: `
        <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e3e3e3; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/dxkdisqjb/image/upload/v1743410024/nks22iksmhsa6mg3cyby.png" alt="Paws & Hearts Logo" style="max-width: 150px; height: auto;">
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px;">
            <h2 style="color: #4a4a4a; margin-top: 0; text-align: center;">Password Reset</h2>
            <p style="color: #666; line-height: 1.5;">You have requested to reset your password. Please use the following code to continue:</p>
            <div style="background-color: #ffffff; border: 1px dashed #ccc; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 8px; margin: 20px 0; border-radius: 4px;">
              <strong style="color: #ff6b6b;">${resetCode}</strong>
            </div>
            <p style="color: #666; line-height: 1.5;">This code will expire in <strong>5 minutes</strong>.</p>
            <p style="color: #666; line-height: 1.5;">If you didn't request a password reset, please ignore this email.</p>
          </div>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e3e3e3; text-align: center; color: #888; font-size: 12px;">
            <p style="margin-bottom: 5px;">Warm regards,<br><strong>Paws & Hearts Team</strong></p>
            <p>&copy; 2025 Paws & Hearts. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Código enviado correctamente' };
  } catch (error) {
    throw new Error(`Error enviando código: ${error.message}`);
  }
};

// Verificar código de restablecimiento
const verifyResetCode = async (email, code) => {
  try {
    // Buscar usuario por email
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      throw new Error('Usuario no encontrado');
    }

    const userId = userSnapshot.docs[0].id;

    // Buscar código de restablecimiento
    const resetCodeDoc = await db.collection('resetCodes').doc(userId).get();

    if (!resetCodeDoc.exists) {
      throw new Error('No se ha solicitado restablecimiento de contraseña');
    }

    const resetCodeData = resetCodeDoc.data();

    // Verificar que el código no haya expirado
    const expiresAt = new Date(resetCodeData.expiresAt);
    if (expiresAt < new Date()) {
      throw new Error('El código ha expirado');
    }

    // Verificar que el código no haya sido usado
    if (resetCodeData.used) {
      throw new Error('El código ya ha sido utilizado');
    }

    // Verificar que el código sea correcto
    if (resetCodeData.code !== code) {
      throw new Error('Código incorrecto');
    }

    return { success: true, userId };
  } catch (error) {
    throw new Error(`Error verificando código: ${error.message}`);
  }
};

// Resetear contraseña
const resetPassword = async (email, code, newPassword) => {
  try {
    // Verificar el código primero
    const { success, userId } = await verifyResetCode(email, code);

    if (!success) {
      throw new Error('Verificación de código fallida');
    }

    // Hashear la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña en la base de datos
    await db.collection('users').doc(userId).update({
      password: hashedPassword
    });

    // Marcar el código como usado
    await db.collection('resetCodes').doc(userId).update({
      used: true
    });

    return { success: true, message: 'Contraseña actualizada correctamente' };
  } catch (error) {
    throw new Error(`Error reseteando contraseña: ${error.message}`);
  }
};

module.exports = {
  verifyEmail,
  sendResetCode,
  verifyResetCode,
  resetPassword
};