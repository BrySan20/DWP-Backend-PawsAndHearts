const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Función para crear el objeto de credenciales desde variables de entorno
const getServiceAccountFromEnv = () => {
  return {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
  };
};

// Determinar qué credenciales usar (archivo local o variables de entorno)
let serviceAccount;

// Verificar si estamos en producción o si faltan variables de entorno
if (process.env.NODE_ENV === 'production' || !fs.existsSync(path.join(__dirname, 'serviceAccountKey.json'))) {
  // Usar variables de entorno
  serviceAccount = getServiceAccountFromEnv();
} else {
  // Usar archivo local para desarrollo
  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (error) {
    console.error('Error al cargar serviceAccountKey.json:', error);
    console.log('Usando variables de entorno como alternativa');
    serviceAccount = getServiceAccountFromEnv();
  }
}

// Inicializar Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = db;