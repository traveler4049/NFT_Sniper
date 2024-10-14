// Import the encryption utilities
const { encryptSecretKey, decryptSecretKey } = require('./utils/encryptionUtils');

// Define a sample secret key for testing
const secretKey = 'this_is_a_test_secret_key';

// Encrypt the secret key
const encryptedKey = encryptSecretKey(secretKey);
console.log('Encrypted Key:', encryptedKey);

// Decrypt the encrypted key
const decryptedKey = decryptSecretKey(encryptedKey);
console.log('Decrypted Key:', decryptedKey);

// Check if decryption matches the original secret key
if (decryptedKey === secretKey) {
  console.log('Encryption and decryption are working correctly!');
} else {
  console.error('Something went wrong with encryption or decryption.');
}

