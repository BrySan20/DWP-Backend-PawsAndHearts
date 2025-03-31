// DWP-Backend-PawsAndHearts/src/server.js
const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');
const port = 3000;
require('dotenv').config();

// Crear el servidor HTTP
const server = http.createServer(app);

// Inicializar Socket.io
const io = socketIo(server, {
  cors: {
    origin: "*", // Permite todas las conexiones (cámbialo en producción)
    methods: ["GET", "POST"]
  }
});

// Socket.io logic
require('./services/chatService')(io);

// Escuchar en el puerto
server.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});