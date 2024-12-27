const admin = require('firebase-admin')
const ENV = require('./config')

let FIRESTORE_DB

const connectFirestoreDatabase = () => {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: ENV.FIREBASE_TYPE,
      project_id: ENV.FIREBASE_PROJECT_ID,
      private_key_id: ENV.FIREBASE_PRIVATE_KEY_ID,
      private_key: ENV.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace escaped newlines
      client_email: ENV.FIREBASE_CLIENT_EMAIL,
      client_id: ENV.FIREBASE_CLIENT_ID,
      auth_uri: ENV.FIREBASE_AUTH_URI,
      token_uri: ENV.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: ENV.FIREBASE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: ENV.FIREBASE_CLIENT_CERT_URL,
      universe_domain: ENV.FIREBASE_UNIVERSAL_DOMAIN
    }),
  })

  FIRESTORE_DB = admin.firestore()

  console.log("Connected to Firebase Firestore Database")
}

const getFirestoreDatabase = () => {
  if (!FIRESTORE_DB) {
    throw new Error("No database to connect!")
  }
  return FIRESTORE_DB
}

module.exports = {
  connectFirestoreDatabase,
  getFirestoreDatabase
}
