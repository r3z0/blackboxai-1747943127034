# Secure Messenger

End-to-end encrypted messaging platform with Monero cryptocurrency transfers.

## Features
- Military-grade E2E encryption (XChaCha20-Poly1305)
- Monero cryptocurrency wallet integration
- Development mode with mock wallet
- Self-destructing messages
- Multi-device sync
- Anonymous accounts
- Decentralized architecture
- Automatic fallback for development

## Tech Stack
- **Frontend**: Next.js
- **Backend**: Express.js
- **Cryptography**: Libsodium
- **Blockchain**: Monero RPC
- **Database**: MongoDB
- **Auth**: WebAuthn

## Installation
```bash
git clone https://github.com/yourorg/secure-messenger.git
cd secure-messenger
npm install
```

## Configuration
1. Create `.env` file:
```env
MONERO_DAEMON_URI=http://localhost:28088
MONERO_RPC_USER=your_rpc_username
MONERO_RPC_PASSWORD=your_rpc_password
MONERO_WALLET_PASSWORD=secure_password
NODE_ENV=development
PORT=8000
```

## Running
```bash
# Start in development mode (uses mock wallet)
NODE_ENV=development PORT=8000 npm start

# Start in production mode (requires Monero daemon)
NODE_ENV=production npm start
```

### Development Mode
- Includes mock wallet functionality
- No Monero daemon required
- Simulated transactions for testing
- Available endpoints:
  - GET / - API information
  - POST /wallets - Create new wallet
  - GET /balance/:userId - Check balance
  - POST /send - Send payment

## Security
- End-to-end encryption using XChaCha20-Poly1305
- Forward secrecy with double ratchet algorithm
- Secure enclave for key storage
- Zero-knowledge proofs for authentication

## Monero Integration
- Hierarchical deterministic wallets (BIP-44)
- Cold storage integration
- Multi-signature transactions
- Payment proof verification

## License
GNU Affero General Public License v3.0
