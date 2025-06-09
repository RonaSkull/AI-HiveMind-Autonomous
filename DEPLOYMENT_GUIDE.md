# AI HiveMind Autonomous - Deployment Guide

This guide provides step-by-step instructions for deploying the AI HiveMind Autonomous platform, including the smart contracts, backend services, and frontend application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Smart Contract Deployment](#smart-contract-deployment)
3. [Frontend Setup](#frontend-setup)
4. [Backend Services](#backend-services)
5. [Environment Configuration](#environment-configuration)
6. [Deployment to Production](#deployment-to-production)
7. [Verification and Testing](#verification-and-testing)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or later)
- npm or yarn
- Git
- Hardhat (for smart contract deployment)
- MetaMask browser extension
- An Infura account (for connecting to Ethereum networks)
- An Alchemy account (for enhanced node access)
- A CoinMarketCap API key (for gas price estimation)
- An Etherscan API key (for contract verification)

## Smart Contract Deployment

### 1. Set up environment variables

Create a `.env` file in the project root with the following variables:

```env
# Network RPC URLs
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Private Keys (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Wallet Addresses
REVENUE_WALLET=0x0000000000000000000000000000000000000000

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key

# Qwen AI Configuration
QWEN_API_KEY=your_qwen_api_key

# Gas Reporter (optional)
REPORT_GAS=false
```

### 2. Install dependencies

```bash
npm install
```

### 3. Compile contracts

```bash
npx hardhat compile
```

### 4. Deploy to local network

```bash
npx hardhat node
```

In a separate terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 5. Deploy to testnet (Sepolia)

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 6. Verify contract on Etherscan

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "REVENUE_WALLET_ADDRESS"
```

## Frontend Setup

### 1. Navigate to frontend directory

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
NEXT_PUBLIC_INFURA_ID=your_infura_project_id
```

### 4. Run development server

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
```

### 6. Start production server

```bash
npm start
```

## Backend Services

### 1. Set up environment variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=your_database_connection_string
REDIS_URL=your_redis_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=production
PORT=3001
```

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Run database migrations

```bash
npx knex migrate:latest
```

### 4. Start the backend server

```bash
npm start
```

## Environment Configuration

### Required Environment Variables

#### Frontend

- `NEXT_PUBLIC_CONTRACT_ADDRESS`: The address of your deployed AINFTVault contract
- `NEXT_PUBLIC_INFURA_ID`: Your Infura project ID for Ethereum node access

#### Backend

- `DATABASE_URL`: Connection string for your PostgreSQL database
- `REDIS_URL`: Connection string for Redis (for caching and rate limiting)
- `JWT_SECRET`: Secret key for JWT token signing
- `NODE_ENV`: Environment (development, production)
- `PORT`: Port to run the backend server on

#### Smart Contracts

- `PRIVATE_KEY`: Private key of the deployer account
- `ALCHEMY_SEPOLIA_URL`: Alchemy API URL for Sepolia testnet
- `ETHERSCAN_API_KEY`: API key for Etherscan verification
- `COINMARKETCAP_API_KEY`: API key for gas price estimation
- `REVENUE_WALLET`: Wallet address to receive revenue share

## Deployment to Production

### 1. Smart Contracts

1. Deploy to mainnet:
   ```bash
   npx hardhat run scripts/deploy.js --network mainnet
   ```

2. Verify on Etherscan:
   ```bash
   npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS "REVENUE_WALLET_ADDRESS"
   ```

### 2. Frontend

#### Vercel

1. Push your code to a GitHub repository
2. Import the repository in Vercel
3. Set up environment variables in Vercel
4. Deploy

#### Netlify

1. Push your code to a GitHub repository
2. Import the repository in Netlify
3. Set up environment variables in Netlify
4. Set the build command to `npm run build`
5. Set the publish directory to `.next`
6. Deploy

### 3. Backend

#### Heroku

1. Install the Heroku CLI
2. Login to Heroku:
   ```bash
   heroku login
   ```
3. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```
4. Set environment variables:
   ```bash
   heroku config:set DATABASE_URL=your_database_url
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   ```
5. Deploy:
   ```bash
   git push heroku main
   ```

## Verification and Testing

### 1. Smart Contract Tests

```bash
npx hardhat test
```

### 2. Frontend Tests

```bash
cd frontend
npm test
```

### 3. Backend Tests

```bash
cd backend
npm test
```

## Monitoring and Maintenance

### 1. Smart Contracts

- Monitor contract events using Tenderly or OpenZeppelin Defender
- Set up alerts for critical functions
- Regularly audit the contract code

### 2. Frontend

- Monitor performance using Vercel Analytics or similar
- Set up error tracking with Sentry
- Regularly update dependencies

### 3. Backend

- Monitor server health and response times
- Set up logging with Papertrail or similar
- Implement rate limiting and security headers

## Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **Access Control**: Implement proper access control in smart contracts
3. **Input Validation**: Validate all user inputs on both frontend and backend
4. **Rate Limiting**: Implement rate limiting on API endpoints
5. **HTTPS**: Always use HTTPS in production
6. **CORS**: Configure CORS properly to prevent unauthorized access
7. **Dependencies**: Keep all dependencies up to date

## Troubleshooting

### Contract Deployment Fails

- Check that you have sufficient ETH in your deployer account
- Verify that your RPC URL is correct
- Check gas prices and adjust if necessary

### Frontend Not Connecting to Contract

- Ensure the contract address is correct
- Check that MetaMask is connected to the correct network
- Verify that the contract ABI matches the deployed contract

### Backend Connection Issues

- Check that the database is running and accessible
- Verify all environment variables are set correctly
- Check server logs for errors

## Support

For support, please open an issue in the GitHub repository or contact the development team.
