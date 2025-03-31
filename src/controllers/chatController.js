// Modificación para DWP-Backend-PawsAndHearts/src/controllers/chatController.js
const db = require('../config/firebase');

// Obtener historial de chat
const getChatHistory = async (req, res) => {
  try {
    const { userId } = req;
    const { adopterId } = req.query; // Para admins que quieren ver chat con un adoptante específico
    
    // Obtener el rol del usuario
    const userRef = await db.collection('users').doc(userId).get();
    if (!userRef.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const user = userRef.data();
    
    // Para adoptantes: obtener conversación con admin
    if (user.role === 'adopter') {
      const chatSnapshot = await db.collection('chats')
        .where('adopterId', '==', userId)
        .orderBy('timestamp', 'asc')
        .get();
      
      const messages = [];
      chatSnapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      
      return res.status(200).json(messages);
    }
    
    // Para admins: obtener lista de adoptantes o chat específico
    if (user.role === 'admin') {
      if (adopterId) {
        // Consulta de chat específico
        const chatSnapshot = await db.collection('chats')
          .where('adopterId', '==', adopterId)
          .orderBy('timestamp', 'asc')
          .get();
        
        const messages = [];
        chatSnapshot.forEach(doc => {
          messages.push({ id: doc.id, ...doc.data() });
        });
        
        return res.status(200).json(messages);
      } else {
        // Consulta de lista de adoptantes con chat
        const uniqueAdopterIds = new Set();
        const chatSnapshot = await db.collection('chats')
          .orderBy('timestamp', 'desc')
          .limit(100)
          .get();
        
        chatSnapshot.forEach(doc => {
          uniqueAdopterIds.add(doc.data().adopterId);
        });
        
        // Obtener información de adoptantes
        const adoptersList = [];
        for (const adopterId of uniqueAdopterIds) {
          const adopterDoc = await db.collection('users').doc(adopterId).get();
          if (adopterDoc.exists) {
            // Obtener último mensaje
            const lastMsgSnapshot = await db.collection('chats')
              .where('adopterId', '==', adopterId)
              .orderBy('timestamp', 'desc')
              .limit(1)
              .get();
            
            let lastMessage = '';
            let timestamp = '';
            
            if (!lastMsgSnapshot.empty) {
              lastMessage = lastMsgSnapshot.docs[0].data().message;
              timestamp = lastMsgSnapshot.docs[0].data().timestamp;
            }
            
            adoptersList.push({
              id: adopterId,
              name: adopterDoc.data().fullName || 'Usuario',
              lastMessage,
              timestamp
            });
          }
        }
        
        return res.status(200).json(adoptersList);
      }
    }
    
    return res.status(403).json({ error: 'No autorizado' });
  } catch (error) {
    console.error('Error al obtener historial de chat:', error);
    return res.status(500).json({ error: 'Error al obtener historial de chat' });
  }
};

module.exports = {
  getChatHistory
};