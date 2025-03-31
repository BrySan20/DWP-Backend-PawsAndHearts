//DWP-Backend-PawsAndHearts/src/services/chatService.js
const db = require('../config/firebase');

module.exports = (io) => {
  // Almacenar usuarios conectados: { userId: socketId }
  const connectedUsers = {};
  // Almacenar admins conectados: [socketId]
  const connectedAdmins = [];
  
  io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);
    
    // Cuando un usuario se identifica
    socket.on('user-connected', async ({ userId, role }) => {
      console.log(`Usuario ${userId} (${role}) conectado con socket ID: ${socket.id}`);
      
      // Guardar conexión según el rol
      if (role === 'admin') {
        connectedAdmins.push(socket.id);
        
        // Obtener lista de chats para admin
        try {
          const uniqueAdopterIds = new Set();
          const chatSnapshot = await db.collection('chats')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();
          
          if (!chatSnapshot.empty) {
            chatSnapshot.forEach(doc => {
              uniqueAdopterIds.add(doc.data().adopterId);
            });
            
            // Obtener información de adoptantes
            const adoptersList = [];
            for (const adopterId of uniqueAdopterIds) {
              const adopterDoc = await db.collection('users').doc(adopterId).get();
              if (adopterDoc.exists) {
                adoptersList.push({
                  id: adopterId,
                  name: adopterDoc.data().fullName || 'Usuario',
                  lastMessage: null // Se llenará después
                });
              }
            }
            
            // Obtener el último mensaje para cada adoptante
            for (let i = 0; i < adoptersList.length; i++) {
              const lastMsgSnapshot = await db.collection('chats')
                .where('adopterId', '==', adoptersList[i].id)
                .orderBy('timestamp', 'desc')
                .limit(1)
                .get();
              
              if (!lastMsgSnapshot.empty) {
                adoptersList[i].lastMessage = lastMsgSnapshot.docs[0].data().message;
                adoptersList[i].timestamp = lastMsgSnapshot.docs[0].data().timestamp;
              }
            }
            
            // Enviar lista de chats al admin
            socket.emit('admin-chat-list', adoptersList);
          }
        } catch (error) {
          console.error('Error al obtener lista de chats para admin:', error);
        }
      } else {
        connectedUsers[userId] = socket.id;
        
        // Si es adoptante, buscar mensajes pendientes
        try {
          const chatSnapshot = await db.collection('chats')
            .where('adopterId', '==', userId)
            .orderBy('timestamp', 'asc')
            .get();
          
          if (!chatSnapshot.empty) {
            // Obtener información del admin para el chat
            const adminSnapshot = await db.collection('users')
              .where('role', '==', 'admin')
              .limit(1)
              .get();
            
            let adminInfo = { id: 'admin', name: 'Administrador' };
            if (!adminSnapshot.empty) {
              const adminDoc = adminSnapshot.docs[0];
              adminInfo = {
                id: adminDoc.id,
                name: adminDoc.data().fullName || 'Administrador'
              };
            }
            
            // Enviar historial de mensajes e info de admin al adoptante
            const messages = [];
            chatSnapshot.forEach(doc => {
              messages.push({ id: doc.id, ...doc.data() });
            });
            
            socket.emit('chat-history', {
              messages,
              adminInfo
            });
          }
        } catch (error) {
          console.error('Error al obtener historial de chat:', error);
        }
      }
    });
    
    // Cuando un admin selecciona un chat
    socket.on('admin-select-chat', async ({ adopterId }) => {
      try {
        // Cargar historial de chat con este adoptante
        const chatSnapshot = await db.collection('chats')
          .where('adopterId', '==', adopterId)
          .orderBy('timestamp', 'asc')
          .get();
        
        if (!chatSnapshot.empty) {
          const messages = [];
          chatSnapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
          });
          
          // Obtener info del adoptante
          const adopterDoc = await db.collection('users').doc(adopterId).get();
          let adopterInfo = { id: adopterId, name: 'Usuario' };
          
          if (adopterDoc.exists) {
            adopterInfo = {
              id: adopterId,
              name: adopterDoc.data().fullName || 'Usuario'
            };
          }
          
          // Enviar historial e info del adoptante al admin
          socket.emit('admin-chat-history', {
            messages,
            adopterInfo
          });
        }
      } catch (error) {
        console.error('Error al cargar chat para admin:', error);
      }
    });
    
    // Cuando se recibe un mensaje
    socket.on('send-message', async (message) => {
      try {
        // Guardar mensaje en Firestore
        const msgData = {
          message: message.text,
          senderId: message.senderId,
          senderName: message.senderName,
          senderRole: message.senderRole,
          adopterId: message.adopterId,
          receiverId: message.receiverId || null,
          timestamp: new Date().toISOString()
        };
        
        const docRef = await db.collection('chats').add(msgData);
        const savedMsg = { id: docRef.id, ...msgData };
        
        // Emitir mensaje al sender para confirmación
        socket.emit('message-sent', savedMsg);
        
        // Emitir mensaje al destinatario según su rol
        if (message.senderRole === 'adopter') {
          // Mensaje de adoptante -> admin
          // Enviar a todos los admins conectados
          connectedAdmins.forEach(adminSocketId => {
            io.to(adminSocketId).emit('new-message', {
              message: savedMsg,
              adopterId: message.adopterId,
              adopterName: message.senderName
            });
          });
        } else {
          // Mensaje de admin -> adoptante
          const adopterSocketId = connectedUsers[message.adopterId];
          if (adopterSocketId) {
            io.to(adopterSocketId).emit('new-message', savedMsg);
          }
        }
      } catch (error) {
        console.error('Error al guardar mensaje:', error);
        socket.emit('message-error', { error: 'No se pudo enviar el mensaje' });
      }
    });
    
    // Cuando un usuario se desconecta
    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
      // Eliminar usuario de conectados
      for (const [userId, socketId] of Object.entries(connectedUsers)) {
        if (socketId === socket.id) {
          delete connectedUsers[userId];
          break;
        }
      }
      
      // Verificar si era un admin
      const adminIndex = connectedAdmins.indexOf(socket.id);
      if (adminIndex !== -1) {
        connectedAdmins.splice(adminIndex, 1);
      }
    });
  });
};