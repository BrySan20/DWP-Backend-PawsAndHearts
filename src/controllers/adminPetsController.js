const adminPetsService = require('../services/adminPetsService');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Get all pets
const getAllPets = async (req, res) => {
  try {
    const pets = await adminPetsService.getAllPets();
    return res.status(200).json(pets);
  } catch (error) {
    console.error('Error fetching pets:', error);
    return res.status(500).json({ error: 'Error al obtener mascotas' });
  }
};

// Get a specific pet by ID
const getPetById = async (req, res) => {
  try {
    const petId = req.params.id;
    const pet = await adminPetsService.getPetById(petId);
    
    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }
    
    return res.status(200).json(pet);
  } catch (error) {
    console.error('Error fetching pet:', error);
    return res.status(500).json({ error: 'Error al obtener mascota' });
  }
};

// Create a new pet
const createPet = async (req, res) => {
  try {
    const { name, type, specie, age, size, gender, description } = req.body;
    let photoUrl = null;
    
    // Validate required fields
    if (!name || !type || !specie || !age || !size || !gender || !description) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    // Handle photo upload if exists
    if (req.file) {
      // Convert buffer to base64
      const base64Data = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${base64Data}`;
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'pets',
        resource_type: 'image'
      });
      
      photoUrl = result.secure_url;
    }
    
    const petData = {
      name,
      type,
      specie,
      age,
      size,
      gender,
      description,
      photo: photoUrl
    };
    
    const newPet = await adminPetsService.createPet(petData);
    return res.status(201).json({ message: 'Mascota creada con éxito', pet: newPet });
  } catch (error) {
    console.error('Error creating pet:', error);
    return res.status(500).json({ error: 'Error al crear mascota' });
  }
};

// Update a pet
const updatePet = async (req, res) => {
  try {
    const petId = req.params.id;
    const { name, type, specie, age, size, gender, description } = req.body;
    let photoUrl = null;
    
    // Check if pet exists
    const existingPet = await adminPetsService.getPetById(petId);
    if (!existingPet) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }
    
    // Handle photo upload if exists
    if (req.file) {
      // Convert buffer to base64
      const base64Data = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${base64Data}`;
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'pets',
        resource_type: 'image'
      });
      
      photoUrl = result.secure_url;
    }
    
    const petData = {
      name: name || existingPet.name,
      type: type || existingPet.type,
      specie: specie || existingPet.specie,
      age: age || existingPet.age,
      size: size || existingPet.size,
      gender: gender || existingPet.gender,
      description: description || existingPet.description,
      photo: photoUrl || existingPet.photo
    };
    
    const updatedPet = await adminPetsService.updatePet(petId, petData);
    return res.status(200).json({ message: 'Mascota actualizada con éxito', pet: updatedPet });
  } catch (error) {
    console.error('Error updating pet:', error);
    return res.status(500).json({ error: 'Error al actualizar mascota' });
  }
};

// Delete a pet
const deletePet = async (req, res) => {
  try {
    const petId = req.params.id;
    
    // Check if pet exists
    const existingPet = await adminPetsService.getPetById(petId);
    if (!existingPet) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }
    
    await adminPetsService.deletePet(petId);
    return res.status(200).json({ message: 'Mascota eliminada con éxito' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    return res.status(500).json({ error: 'Error al eliminar mascota' });
  }
};

module.exports = {
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet
};