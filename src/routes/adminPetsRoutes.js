const express = require('express');
const router = express.Router();
const adminPetsController = require('../controllers/adminPetsController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });


// Public routes (no authentication required)
router.get('/public', adminPetsController.getAllPets);
router.get('/public/:id', adminPetsController.getPetById);

// Admin routes (require authentication and admin role)
router.get('/', authMiddleware, adminPetsController.getAllPets);
router.get('/:id', authMiddleware, adminPetsController.getPetById);
router.post('/', authMiddleware, upload.single('photo'), adminPetsController.createPet);
router.put('/:id', authMiddleware, upload.single('photo'), adminPetsController.updatePet);
router.delete('/:id', authMiddleware, adminPetsController.deletePet);

module.exports = router;