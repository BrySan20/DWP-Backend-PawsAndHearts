const userProfileService = require('../services/userProfileService');
const authService = require('../services/authService'); // Import authService

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const updateData = req.body;

    const updatedUser = await userProfileService.updateUserProfile(userId, updateData);
    
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser.data()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ error: 'Error updating profile' });
  }
};

const initiateAccountDeletion = async (req, res) => {
  try {
    const userId = req.userId;
    // Use authService.getUserById instead of userProfileService
    const user = await authService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const verificationCode = await userProfileService.sendDeletionVerificationEmail(user.email);

    return res.status(200).json({ 
      message: 'Verification code sent', 
      email: user.email,
      verificationCode // Include this for frontend verification
    });
  } catch (error) {
    console.error('Account deletion initiation error:', error);
    return res.status(500).json({ error: 'Error initiating account deletion' });
  }
};

const confirmAccountDeletion = async (req, res) => {
  try {
    const userId = req.userId;
    const { verificationCode, inputCode } = req.body;

    if (verificationCode !== inputCode) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    await userProfileService.deleteUserAccount(userId);

    return res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion confirmation error:', error);
    return res.status(500).json({ error: 'Error confirming account deletion' });
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isCurrentPasswordValid = await authService.verifyCurrentPassword(userId, currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    await authService.updateUserPassword(userId, newPassword);

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    return res.status(500).json({ error: 'Error updating password' });
  }
};

module.exports = {
  updateUserProfile,
  initiateAccountDeletion,
  confirmAccountDeletion,
  updateUserPassword
};