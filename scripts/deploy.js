const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying AI NFT Vault contract...");
  
  // Get the contract factory
  const AINFTVault = await hre.ethers.getContractFactory("AINFTVault");
  
  // Deploy the contract
  // Replace with your revenue wallet address
  const revenueWallet = process.env.REVENUE_WALLET || "0x0000000000000000000000000000000000000000";
  const ainftVault = await AINFTVault.deploy(revenueWallet);
  
  // Wait for deployment to complete
  await ainftVault.deployed();
  
  console.log("✅ AINFTVault deployed to:", ainftVault.address);
  
  // Verify the contract on Etherscan if on a live network
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("⏳ Verifying contract on Etherscan...");
    
    // Wait for a few blocks to be mined before verification
    await ainftVault.deployTransaction.wait(6);
    
    // Verify the contract
    await hre.run("verify:verify", {
      address: ainftVault.address,
      constructorArguments: [revenueWallet],
    });
    
    console.log("✅ Contract verified on Etherscan");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
