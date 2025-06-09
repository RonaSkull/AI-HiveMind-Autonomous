import { ethers } from 'ethers';

// ABI for the AINFTVault contract
const AINFT_VAULT_ABI = [
  // ERC721 standard functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function tokenByIndex(uint256 index) view returns (uint256)',
  
  // Custom AINFTVault functions
  'function mintNFT(address to, string memory tokenURI, uint256 price) external returns (uint256)',
  'function buyNFT(uint256 tokenId) external payable',
  'function tokenPrices(uint256) view returns (uint256)',
  'function updateTokenURI(uint256 tokenId, string memory newTokenURI) external',
  'function updateTokenPrice(uint256 tokenId, uint256 newPrice) external',
  'function withdrawRevenue() external',
  'function getBalance() external view returns (uint256)',
];

// Contract addresses (update these with your deployed contract addresses)
const CONTRACT_ADDRESSES = {
  1: '0x0000000000000000000000000000000000000000', // Mainnet
  5: '0x0000000000000000000000000000000000000000', // Goerli
  11155111: '0x0000000000000000000000000000000000000000', // Sepolia
  31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Hardhat localhost
};

// Get contract instance
export const getContract = (chainId, signerOrProvider) => {
  const address = CONTRACT_ADDRESSES[chainId];
  if (!address) {
    throw new Error(`No contract address for chain ID: ${chainId}`);
  }
  return new ethers.Contract(address, AINFT_VAULT_ABI, signerOrProvider);
};

// Format token data for display
export const formatTokenData = (tokenId, tokenURI, price, owner) => ({
  tokenId: tokenId.toString(),
  tokenURI,
  price: ethers.utils.formatEther(price),
  priceWei: price.toString(),
  owner,
  isOwner: false, // This will be set based on the connected account
});

// Fetch all NFTs from the contract
export const fetchAllNFTs = async (contract, account) => {
  try {
    const totalSupply = await contract.totalSupply();
    const nftPromises = [];
    
    for (let i = 0; i < totalSupply; i++) {
      const tokenId = await contract.tokenByIndex(i);
      nftPromises.push(
        Promise.all([
          contract.tokenURI(tokenId),
          contract.tokenPrices(tokenId),
          contract.ownerOf(tokenId),
        ]).then(([tokenURI, price, owner]) => ({
          tokenId: tokenId.toString(),
          tokenURI,
          price: ethers.utils.formatEther(price),
          priceWei: price.toString(),
          owner,
          isOwner: account && account.toLowerCase() === owner.toLowerCase(),
        }))
      );
    }
    
    return await Promise.all(nftPromises);
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    throw error;
  }
};

// Mint a new NFT
export const mintNFT = async (contract, to, tokenURI, price) => {
  try {
    const priceWei = ethers.utils.parseEther(price.toString());
    const tx = await contract.mintNFT(to, tokenURI, priceWei);
    const receipt = await tx.wait();
    return { success: true, receipt };
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw error;
  }
};

// Buy an NFT
export const buyNFT = async (contract, tokenId, price) => {
  try {
    const tx = await contract.buyNFT(tokenId, {
      value: ethers.utils.parseEther(price.toString()),
    });
    const receipt = await tx.wait();
    return { success: true, receipt };
  } catch (error) {
    console.error('Error buying NFT:', error);
    throw error;
  }
};

// Update token URI
export const updateTokenURI = async (contract, tokenId, newTokenURI) => {
  try {
    const tx = await contract.updateTokenURI(tokenId, newTokenURI);
    const receipt = await tx.wait();
    return { success: true, receipt };
  } catch (error) {
    console.error('Error updating token URI:', error);
    throw error;
  }
};

// Update token price
export const updateTokenPrice = async (contract, tokenId, newPrice) => {
  try {
    const priceWei = ethers.utils.parseEther(newPrice.toString());
    const tx = await contract.updateTokenPrice(tokenId, priceWei);
    const receipt = await tx.wait();
    return { success: true, receipt };
  } catch (error) {
    console.error('Error updating token price:', error);
    throw error;
  }
};

// Withdraw revenue
export const withdrawRevenue = async (contract) => {
  try {
    const tx = await contract.withdrawRevenue();
    const receipt = await tx.wait();
    return { success: true, receipt };
  } catch (error) {
    console.error('Error withdrawing revenue:', error);
    throw error;
  }
};

// Get contract balance
export const getContractBalance = async (contract) => {
  try {
    const balance = await contract.getBalance();
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error getting contract balance:', error);
    throw error;
  }
};
