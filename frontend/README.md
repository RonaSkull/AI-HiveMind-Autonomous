# AI HiveMind Frontend

This is the frontend for the AI HiveMind Autonomous platform, built with Next.js and Web3.js.

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- MetaMask browser extension

### Installation

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Create a `.env.local` file in the frontend directory with the following variables:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
   NEXT_PUBLIC_INFURA_ID=your_infura_id
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Connect with MetaMask
- View available AI assets
- Buy/Sell AI-generated content
- View transaction history
- Manage your AI assets

## Project Structure

```
frontend/
├── components/     # Reusable React components
├── pages/          # Next.js pages
├── styles/         # Global styles
├── utils/          # Utility functions
└── contracts/      # ABI and contract interaction
```

## Technologies Used

- Next.js
- React
- Web3.js
- Tailwind CSS
- Ethers.js

## License

MIT
