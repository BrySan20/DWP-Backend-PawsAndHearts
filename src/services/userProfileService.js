const admin = require('firebase-admin');
const db = require('../config/firebase');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

// Generate a random 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email for account deletion
const sendDeletionVerificationEmail = async (email) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  const verificationCode = generateVerificationCode();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Account Deletion Verification - Paws and Hearts',
    html: `
      <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e3e3e3; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://res.cloudinary.com/dxkdisqjb/image/upload/v1743410024/nks22iksmhsa6mg3cyby.png" alt="Paws & Hearts Logo" style="max-width: 150px; height: auto;">
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px;">
          <h2 style="color: #4a4a4a; margin-top: 0; text-align: center;">Account Deletion Request</h2>
          <p style="color: #666; line-height: 1.5;">We have received a request to delete your account. To verify this request, please use the verification code below:</p>
          <div style="background-color: #ffffff; border: 1px dashed #ccc; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 8px; margin: 20px 0; border-radius: 4px;">
            <strong style="color: #ff6b6b;">${verificationCode}</strong>
          </div>
          <p style="color: #666; line-height: 1.5;">If you did not request to delete your account, please secure your account immediately by changing your password.</p>
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e3e3e3; text-align: center; color: #888; font-size: 12px;">
          <p style="margin-bottom: 5px;">Warm regards,<br><strong>Paws & Hearts Team</strong></p>
          <p>&copy; 2025 Paws & Hearts. All rights reserved.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);

  return verificationCode;
};

// Update user profile
const updateUserProfile = async (userId, updateData) => {
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.update(updateData);
    return await userRef.get();
  } catch (error) {
    throw new Error(`Error updating profile: ${error.message}`);
  }
};

// Delete user account and related scheduled adoptions
const deleteUserAccount = async (userId) => {
  const batch = db.batch();

  try {
    // Find and mark scheduled adoptions for deletion
    const scheduledAdoptionsSnapshot = await db.collection('scheduledAdoptions')
      .where('userId', '==', userId)
      .get();

    // Delete all scheduled adoptions for this user
    scheduledAdoptionsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete the user document
    const userRef = db.collection('users').doc(userId);
    batch.delete(userRef);

    // Commit the batch
    await batch.commit();

    return true;
  } catch (error) {
    throw new Error(`Error deleting account: ${error.message}`);
  }
};

module.exports = {
  updateUserProfile,
  deleteUserAccount,
  sendDeletionVerificationEmail
};