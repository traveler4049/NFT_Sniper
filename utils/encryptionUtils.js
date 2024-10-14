// Import necessary libraries
const crypto = require('crypto');
require('dotenv').config();

// Function to encrypt a secret key using AES-256-CBC
function encryptSecretKey(secretKey) {
  console.log('Starting encryption process...');
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_SECRET, 'salt', 32);
  console.log('Derived encryption key:', key.toString('hex'));
  const iv = crypto.randomBytes(16);
  console.log('Generated IV:', iv.toString('hex'));
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(secretKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  console.log('Encryption successful. Encrypted value:', encrypted);
  return `${iv.toString('hex')}:${encrypted}`;
}

// Function to decrypt an encrypted key using AES-256-CBC
function decryptSecretKey(encryptedKey) {
  console.log('Starting decryption process...');
  const algorithm = 'aes-256-cbc';
  const [ivHex, encrypted] = encryptedKey.split(':');
  console.log('IV for decryption:', ivHex);
  const key = crypto.scryptSync(process.env.ENCRYPTION_SECRET, 'salt', 32);
  console.log('Derived decryption key:', key.toString('hex'));
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  console.log('Decryption successful. Decrypted value:', decrypted);
  return decrypted;
}

module.exports = { encryptSecretKey, decryptSecretKey };

// Note:
// - Make sure to set the ENCRYPTION_SECRET in your .env file.
// - The ENCRYPTION_SECRET should be a strong, unique passphrase to ensure the security of the encrypted data.

