const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/userProfileController');
const authMiddleware = require('../middlewares/authMiddleware');

router.put('/update', authMiddleware, userProfileController.updateUserProfile);
router.post('/delete/initiate', authMiddleware, userProfileController.initiateAccountDeletion);
router.post('/delete/confirm', authMiddleware, userProfileController.confirmAccountDeletion);
router.put('/update-password', authMiddleware, userProfileController.updateUserPassword);

module.exports = router;