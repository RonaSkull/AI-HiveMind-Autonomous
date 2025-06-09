// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AINFTVault is ERC721, ReentrancyGuard, Ownable {
    // Token counter
    uint256 private _tokenIdCounter;
    
    // Token metadata
    mapping(uint256 => string) private _tokenURIs;
    
    // Token price
    mapping(uint256 => uint256) public tokenPrices;
    
    // Revenue distribution
    address public revenueWallet;
    uint256 public constant REVENUE_PERCENTAGE = 90; // 90% to revenue wallet
    
    // Events
    event NFTMinted(address indexed owner, uint256 tokenId, string tokenURI, uint256 price);
    event NFTSold(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
    event RevenueWithdrawn(address indexed wallet, uint256 amount);
    
    constructor(address _revenueWallet) ERC721("AINFT", "AINFT") {
        require(_revenueWallet != address(0), "Invalid revenue wallet");
        revenueWallet = _revenueWallet;
        _tokenIdCounter = 1; // Start token IDs from 1
    }
    
    // Modifier to check token existence
    modifier tokenExists(uint256 tokenId) {
        require(_exists(tokenId), "Token does not exist");
        _;
    }
    
    // Mint a new NFT (only owner)
    function mintNFT(address to, string memory tokenURI, uint256 price) external onlyOwner returns (uint256) {
        uint256 newTokenId = _tokenIdCounter;
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        tokenPrices[newTokenId] = price;
        _tokenIdCounter++;
        
        emit NFTMinted(to, newTokenId, tokenURI, price);
        return newTokenId;
    }
    
    // Buy an NFT
    function buyNFT(uint256 tokenId) external payable nonReentrant tokenExists(tokenId) {
        address seller = ownerOf(tokenId);
        uint256 price = tokenPrices[tokenId];
        
        require(msg.value >= price, "Insufficient payment");
        require(msg.sender != seller, "Cannot buy your own NFT");
        
        // Calculate revenue (90% to revenue wallet, 10% to seller)
        uint256 revenueShare = (msg.value * REVENUE_PERCENTAGE) / 100;
        uint256 sellerShare = msg.value - revenueShare;
        
        // Transfer NFT
        _transfer(seller, msg.sender, tokenId);
        
        // Transfer funds
        (bool success1, ) = revenueWallet.call{value: revenueShare}("");
        (bool success2, ) = payable(seller).call{value: sellerShare}("");
        
        require(success1 && success2, "Transfer failed");
        
        emit NFTSold(seller, msg.sender, tokenId, price);
    }
    
    // Update token URI (only owner)
    function updateTokenURI(uint256 tokenId, string memory newTokenURI) external onlyOwner tokenExists(tokenId) {
        _setTokenURI(tokenId, newTokenURI);
    }
    
    // Update token price (only owner)
    function updateTokenPrice(uint256 tokenId, uint256 newPrice) external onlyOwner tokenExists(tokenId) {
        tokenPrices[tokenId] = newPrice;
    }
    
    // Internal function to set token URI
    function _setTokenURI(uint256 tokenId, string memory tokenURI) internal {
        require(_exists(tokenId), "Token does not exist");
        _tokenURIs[tokenId] = tokenURI;
    }
    
    // Get token URI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenURIs[tokenId];
    }
    
    // Withdraw revenue (only owner)
    function withdrawRevenue() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = revenueWallet.call{value: balance}("");
        require(success, "Transfer failed");
        
        emit RevenueWithdrawn(revenueWallet, balance);
    }
    
    // Receive function to accept ETH
    receive() external payable {}
}
