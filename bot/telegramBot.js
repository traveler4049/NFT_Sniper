// Import necessary packages and libraries
const { Telegraf, Markup } = require('telegraf');
const { Keypair } = require('@solana/web3.js');
const fs = require('fs');
const { exec } = require('child_process');
const { getUserWalletFromDatabase, saveWalletToDatabase } = require('../utils/databaseUtils');
const { decryptSecretKey, encryptSecretKey } = require('../utils/encryptionUtils');
require('dotenv').config();
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');

const dotenv = require('dotenv');
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Create a new instance of the Telegram bot with the bot token
const bot = new Telegraf(process.env.BOT_TOKEN);

// Step 1: Handle /start command and wallet creation
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const existingWallet = await getUserWalletFromDatabase(userId);

  if (existingWallet) {
    ctx.reply('Welcome back! Your wallet is ready for use. Use the buttons below to interact with the NFT marketplace.',
      Markup.inlineKeyboard([
        [Markup.button.callback('View Listings', 'VIEW_LISTINGS')],
        [Markup.button.callback('Make a Bid', 'MAKE_BID')],
        [Markup.button.callback('Buy NFT', 'BUY_NFT')],
        [Markup.button.callback('Sell NFT', 'SELL_NFT')],
      ])
    );
  } else {
    const newKeypair = Keypair.generate();
    const walletInfo = {
      publicKey: newKeypair.publicKey.toBase58(),
      secretKey: encryptSecretKey(newKeypair.secretKey.toString('base64')),
    };
    await saveWalletToDatabase(userId, walletInfo);
    ctx.reply('Welcome! A new wallet has been generated for you. Use the buttons below to interact with the NFT marketplace.',
      Markup.inlineKeyboard([
        [Markup.button.callback('View Listings', 'VIEW_LISTINGS')],
        [Markup.button.callback('Make a Bid', 'MAKE_BID')],
        [Markup.button.callback('Buy NFT', 'BUY_NFT')],
        [Markup.button.callback('Sell NFT', 'SELL_NFT')],
      ])
    );
  }
});

// Step 2: Handle inline button actions
bot.action('VIEW_LISTINGS', async (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('Fetching all your listings...');
  // Add logic to fetch listings from Tensor marketplace here
});

bot.action('MAKE_BID', async (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('Please provide the NFT mint address and bid amount.');
  // Add logic for making a bid
});

bot.action('BUY_NFT', async (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('Please provide the NFT mint address you want to buy.');
  // Add logic for buying an NFT
});

bot.action('SELL_NFT', async (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('Please provide the NFT mint address and the amount you want to list it for.');
  // Add logic for selling an NFT
});

// Step 3: Generate common.ts dynamically for each user
async function generateCommonFile(userId) {
  const userWallet = await getUserWalletFromDatabase(userId);
  const secretKey = decryptSecretKey(userWallet.secretKey);

  const content = `
    import { getBase58Encoder, createSolanaRpc } from '@solana/web3.js';

    export const keypairBytes = new Uint8Array(
      getBase58Encoder().encode('${secretKey}')
    );
    export const helius_url = 'https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_RPC_KEY}';
    export const rpc = createSolanaRpc(helius_url);
  `;

  fs.writeFileSync(`common_${userId}.ts`, content); // Write a unique common file for each user
}

// Step 4: Execute SDK script for user
async function executeUserTransaction(userId, scriptName) {
  await generateCommonFile(userId);
  exec(`npx tsx ${scriptName} --common common_${userId}.ts`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error: ${err}`);
      return;
    }
    console.log(`Output: ${stdout}`);
  });
}

// Step 5: Launch the bot
bot.launch();

// Optional: Handle graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

