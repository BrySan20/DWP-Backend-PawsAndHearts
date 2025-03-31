const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const port = process.env.PORT || 3000;

// Opciones CORS compartidas
const corsOptions = {
  origin: [
    'https://dwp-frontend-pawsandhearts.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Compartir las opciones CORS con app.js
app.corsOptions = corsOptions;

// Crear el servidor HTTP
const server = http.createServer(app);

// Inicializar Socket.io con las mismas opciones CORS
const io = socketIo(server, {
  cors: corsOptions
});

// Socket.io logic
require('./services/chatService')(io);

// Escuchar en el puerto
server.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});