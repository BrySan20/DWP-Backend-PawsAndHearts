const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const adminPetsRoutes = require('./routes/adminPetsRoutes');
const adopterPetsRoutes = require('./routes/adopterRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const userFavoritesRoutes = require('./routes/userFavoritesRoutes');
const adoptPetRoutes = require('./routes/adoptPetRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const contactRoutes = require('./routes/contactRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const completedAdoptionRoutes = require('./routes/completedAdoptionRoutes');
const mfaRoutes = require('./routes/mfaRoutes');
const loginMfaRoutes = require('./routes/loginMfaRoutes');
const resetOtpRoutes = require('./routes/resetOtpRoutes');
const resetPassRoutes = require('./routes/resetPassRoutes');
const chatRoutes = require('./routes/chatRoutes');
const dotenv = require('dotenv');
require('dotenv').config();

// Load environment variables
dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Rutas login y registro
app.use('/api/auth', authRoutes);

// Rutas para administración de mascotas
app.use('/api/pets/admin', adminPetsRoutes);

// Rutas para adopción de mascotas
app.use('/api/pets', adopterPetsRoutes);

// Rutas para añadir a favoritos
app.use('/api/favorites', favoritesRoutes);

// Nueva ruta para obtener favoritos del usuario
app.use('/api/user-favorites', userFavoritesRoutes);

// Add this after the existing routes
app.use('/api/adopt', adoptPetRoutes);

// Add profile routes
app.use('/api/profile', userProfileRoutes);

// Add contact routes
app.use('/api/contact', contactRoutes);

// Add appointment routes
app.use('/api/adoptions', appointmentRoutes);

// Add completed adoption routes
app.use('/api/completed-adoptions', completedAdoptionRoutes);

// Add MFA routes
app.use('/api/mfa', mfaRoutes);

// Add login MFA routes
app.use('/api/login-mfa', loginMfaRoutes);

// Add reset OTP routes
app.use('/api/reset-otp', resetOtpRoutes);

// Add reset password routes
app.use('/api/reset-password', resetPassRoutes);

// Add chat routes
app.use('/api/chat', chatRoutes);

module.exports = app;