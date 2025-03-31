const authService = require('../services/authService');

const registerUser = async (req, res) => {
  const { email, fullName, password } = req.body;

  if (!email || !fullName || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = await authService.registerUser(email, fullName, password);
    return res.status(201).json({ message: 'You have successfully registered', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error registering user' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const userData = await authService.loginUser(email, password);
    return res.status(200).json({ message: 'Successfull Login', user: userData });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Incorrect credentials' });
  }
};

// Obtener datos del usuario autenticado
const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId; // Obtenido del middleware
    const user = await authService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error getting user profile' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
