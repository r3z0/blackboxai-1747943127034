import moneroJs from 'monero-ts';

const config = {
  daemonUri: process.env.MONERO_DAEMON_URI || 'http://localhost:28088',
  daemonUsername: process.env.MONERO_RPC_USER || '',
  daemonPassword: process.env.MONERO_RPC_PASSWORD || '',
  networkType: process.env.NODE_ENV === 'production' ? 'mainnet' : 'stagenet',
  walletPassword: process.env.MONERO_WALLET_PASSWORD || 'securepassword',
  walletName: 'secure_messenger_wallet',
  accountIndex: 0
};

class MoneroWalletManager {
  constructor() {
    this.wallets = new Map();
    this.walletRpc = null;
    this.wallet = null;
  }

  async initialize() {
    try {
      // Connect to wallet RPC with retries
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`Attempting to connect to Monero daemon (attempt ${attempt}/3)...`);
          this.walletRpc = await moneroJs.connectToWalletRpc(
            config.daemonUri,
            config.daemonUsername,
            config.daemonPassword
          );
          break;
        } catch (error) {
          if (attempt === 3) throw error;
          console.log('Connection failed, retrying in 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Create or open wallet
      try {
        this.wallet = await this.walletRpc.openWallet(
          config.walletName,
          config.walletPassword
        );
      } catch (error) {
        if (error.message.includes('WalletNotFound')) {
          this.wallet = await this.walletRpc.createWallet(
            config.walletName,
            config.walletPassword,
            'English',
            config.networkType
          );
        } else if (process.env.NODE_ENV !== 'production') {
          // Development fallback - mock wallet functionality
          console.warn('Warning: Using mock wallet for development');
          this.wallet = {
            getPrimaryAddress: () => 'mock_address',
            getBalance: () => '0',
            createTx: () => ({ hash: 'mock_tx_hash', fee: '0' }),
            relayTx: () => Promise.resolve()
          };
        } else {
          throw error;
        }
      }

      console.log('Monero wallet initialized successfully');
      return this;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Warning: Failed to initialize Monero wallet, using mock implementation');
        // Development fallback - mock wallet manager functionality
        this.walletRpc = {
          createAddress: () => 'mock_address',
          getBalance: () => '0',
          createAndRelayTx: () => 'mock_tx_hash'
        };
        return this;
      }
      throw error;
    }
  }

  async createWallet(userId) {
    const address = await this.walletRpc.createAddress(userId);
    this.wallets.set(userId, address);
    return address;
  }

  async getBalance(userId) {
    const balance = await this.walletRpc.getBalance(
      config.accountIndex,
      [userId]
    );
    return balance;
  }

  async sendPayment(senderId, recipientAddress, amount) {
    const txHash = await this.walletRpc.createAndRelayTx({
      accountIndex: config.accountIndex,
      address: recipientAddress,
      amount: amount.toString(),
      paymentId: senderId
    });
    return txHash;
  }
}

const walletManager = new MoneroWalletManager();

// Initialize wallet with error handling
walletManager.initialize()
  .then(() => console.log('Monero wallet initialization complete'))
  .catch(err => console.error('Monero initialization failed:', err));

// Cleanup handler for graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nClosing Monero connections...');
  try {
    // Clear wallet references (addresses don't need closing)
    walletManager.wallets.clear();
    
    // Close RPC connection
    if (walletManager.walletRpc) {
      await walletManager.walletRpc.close();
      console.log('Monero RPC connection closed successfully');
    }
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    process.exit(0); // Exit cleanly
  }
});

export default walletManager;
