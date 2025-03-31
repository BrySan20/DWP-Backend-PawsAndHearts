const speakeasy = require('speakeasy');
const db = require('../config/firebase');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configuración de transporter para nodemailer
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

/**
 * Genera y almacena un código de verificación para el reset de OTP
 */
const generateResetCode = async (email) => {
  try {
    // Verificar si el usuario existe y tiene MFA habilitado
    const userSnapshot = await db.collection('users').where('email', '==', email).get();

    if (userSnapshot.empty) {
      throw new Error('Email not found');
    }

    const userData = userSnapshot.docs[0].data();
    const userId = userSnapshot.docs[0].id;

    if (!userData.mfaEnabled) {
      throw new Error('This user does not have two-factor authentication enabled');
    }

    // Generar código de verificación de 6 dígitos
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Código válido por 15 minutos

    // Almacenar código en Firestore
    await db.collection('otpResetCodes').doc(userId).set({
      code: resetCode,
      expiresAt: expiresAt.toISOString(),
      email: email,
      used: false
    });

    // Enviar correo con el código
    await sendResetCodeEmail(email, resetCode);

    return { success: true, userId };
  } catch (error) {
    throw new Error(`Error generating reset code: ${error.message}`);
  }
};

/**
 * Envía el código de verificación por correo electrónico
 */
const sendResetCodeEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verification Code to Reset MFA - Paws And Hearts',
    html: `
      <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e3e3e3; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://res.cloudinary.com/dxkdisqjb/image/upload/v1743410024/nks22iksmhsa6mg3cyby.png" alt="Paws & Hearts Logo" style="max-width: 150px; height: auto;">
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px;">
          <h2 style="color: #4a4a4a; margin-top: 0; text-align: center;">Two-Factor Authentication Reset</h2>
          <p style="color: #666; line-height: 1.5;">You have requested to reset your two-factor authentication. Please use the verification code below to confirm your identity:</p>
          <div style="background-color: #ffffff; border: 1px dashed #ccc; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 8px; margin: 20px 0; border-radius: 4px;">
            <strong style="color: #ff6b6b;">${code}</strong>
          </div>
          <p style="color: #666; line-height: 1.5;">This code will expire in <strong>15 minutes</strong>.</p>
          <p style="color: #666; line-height: 1.5;">If you didn't request this change, you can safely ignore this email.</p>
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e3e3e3; text-align: center; color: #888; font-size: 12px;">
          <p style="margin-bottom: 5px;">Warm regards,<br><strong>Paws & Hearts Team</strong></p>
          <p>&copy; 2025 Paws & Hearts. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Error sending email: ${error.message}`);
  }
};

/**
 * Verifica el código de reinicio de OTP
 */
const verifyResetCode = async (userId, code) => {
  try {
    const codeDoc = await db.collection('otpResetCodes').doc(userId).get();

    if (!codeDoc.exists) {
      throw new Error('Verification code not found');
    }

    const codeData = codeDoc.data();

    // Verificar si el código ya fue utilizado
    if (codeData.used) {
      throw new Error('This code has already been used');
    }

    // Verificar si el código ha expirado
    const expiresAt = new Date(codeData.expiresAt);
    if (expiresAt < new Date()) {
      throw new Error('The verification code has expired');
    }

    // Verificar si el código coincide
    if (codeData.code !== code) {
      throw new Error('Incorrect verification code');
    }

    // Marcar el código como utilizado
    await db.collection('otpResetCodes').doc(userId).update({ used: true });

    return { success: true, email: codeData.email };
  } catch (error) {
    throw new Error(`Error verifying code: ${error.message}`);
  }
};

/**
 * Genera un nuevo secreto OTP y actualiza el usuario
 */
const regenerateOtpSecret = async (email) => {
  try {
    // Generar nuevo secreto
    const secret = speakeasy.generateSecret({
      name: `PawsAndHearts: ${email}`
    });

    // Actualizar en la base de datos
    const userSnapshot = await db.collection('users').where('email', '==', email).get();

    if (userSnapshot.empty) {
      throw new Error('Email not found');
    }

    const userId = userSnapshot.docs[0].id;

    await db.collection('users').doc(userId).update({
      mfaSecret: secret.base32
    });

    return {
      otpauth_url: secret.otpauth_url,
      base32: secret.base32
    };
  } catch (error) {
    throw new Error(`Error generating OTP secret: ${error.message}`);
  }
};

module.exports = {
  generateResetCode,
  verifyResetCode,
  regenerateOtpSecret
};