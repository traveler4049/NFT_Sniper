// Import necessary Firebase Admin libraries
const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

// Load environment variables
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
  });
}

const db = admin.firestore();

// Function to get user wallet from Firestore
const getUserWalletFromDatabase = async (userId) => {
  const docRef = db.collection('userWallets').doc(userId.toString());
  const docSnap = await docRef.get();
  if (docSnap.exists) {
    return docSnap.data();
  } else {
    return null;
  }
};

// Function to save user wallet to Firestore
const saveWalletToDatabase = async (userId, walletInfo) => {
  const docRef = db.collection('userWallets').doc(userId.toString());
  await docRef.set(walletInfo);
};

module.exports = { getUserWalletFromDatabase, saveWalletToDatabase };
