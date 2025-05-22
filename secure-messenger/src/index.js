import express from 'express';
import bodyParser from 'body-parser';
import moneroWalletManager from './config/monero.js';

const app = express();
app.use(bodyParser.json());

// Root route for basic API info
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Secure Messenger Monero Wallet API' });
});

// Initialize wallet manager
async function initializeApp() {
  try {
    await moneroWalletManager.initialize();
    console.log('Monero wallet manager initialized');
  } catch (error) {
    console.error('Failed to initialize wallet manager:', error);
    process.exit(1);
  }
}

await initializeApp();

// Create wallet endpoint
app.post('/wallets', async (req, res) => {
  try {
    const { userId } = req.body;
    const wallet = await moneroWallet.createWallet(userId);
    res.json({ 
      address: await wallet.getPrimaryAddress(),
      height: await wallet.getHeight()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get balance endpoint
app.get('/balance/:userId', async (req, res) => {
  try {
    const balance = await moneroWallet.getBalance(req.params.userId);
    res.json({ balance: balance.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send payment endpoint
app.post('/send', async (req, res) => {
  try {
    const { senderId, recipientAddress, amount } = req.body;
    const tx = await moneroWallet.sendPayment(senderId, recipientAddress, amount);
    res.json({ 
      txHash: tx.getHash(),
      fee: tx.getFee().toString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Monero wallet API running on port ${PORT}`);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});
