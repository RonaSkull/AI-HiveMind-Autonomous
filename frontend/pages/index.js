import { useState, useEffect } from 'react';
import { useMetaMask } from '../hooks/useMetaMask';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

// ABI for the AINFTVault contract
const AINFT_VAULT_ABI = [
  // ERC721 standard functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  
  // Custom AINFTVault functions
  'function mintNFT(address to, string memory tokenURI, uint256 price) external returns (uint256)',
  'function buyNFT(uint256 tokenId) external payable',
  'function tokenPrices(uint256) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function tokenByIndex(uint256 index) view returns (uint256)',
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export default function Home() {
  const { account, isConnected, connect, error } = useMetaMask();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mintForm, setMintForm] = useState({
    tokenURI: '',
    price: '0.01',
  });

  // Connect to the contract
  const getContract = () => {
    if (typeof window.ethereum === 'undefined') return null;
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, AINFT_VAULT_ABI, signer);
  };

  // Fetch all NFTs
  const fetchNFTs = async () => {
    try {
      const contract = getContract();
      if (!contract) return;
      
      const totalSupply = await contract.totalSupply();
      const nftPromises = [];
      
      // Fetch each NFT's data
      for (let i = 0; i < totalSupply; i++) {
        const tokenId = await contract.tokenByIndex(i);
        nftPromises.push(
          contract.tokenURI(tokenId).then(async (tokenURI) => {
            const price = await contract.tokenPrices(tokenId);
            const owner = await contract.ownerOf(tokenId);
            return {
              tokenId: tokenId.toString(),
              tokenURI,
              price: ethers.utils.formatEther(price),
              owner,
            };
          })
        );
      }
      
      const nftData = await Promise.all(nftPromises);
      setNfts(nftData);
    } catch (err) {
      console.error('Error fetching NFTs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mint a new NFT
  const handleMint = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      await connect();
      return;
    }
    
    try {
      const contract = getContract();
      if (!contract) throw new Error('Contract not found');
      
      const price = ethers.utils.parseEther(mintForm.price);
      const tx = await contract.mintNFT(account, mintForm.tokenURI, price);
      await tx.wait();
      
      // Refresh the NFT list
      await fetchNFTs();
      
      // Reset form
      setMintForm({ tokenURI: '', price: '0.01' });
      
      alert('NFT minted successfully!');
    } catch (err) {
      console.error('Error minting NFT:', err);
      alert('Failed to mint NFT: ' + (err.message || 'Unknown error'));
    }
  };

  // Buy an NFT
  const handleBuy = async (tokenId, price) => {
    if (!isConnected) {
      await connect();
      return;
    }
    
    try {
      const contract = getContract();
      if (!contract) throw new Error('Contract not found');
      
      const tx = await contract.buyNFT(tokenId, {
        value: ethers.utils.parseEther(price),
      });
      
      await tx.wait();
      
      // Refresh the NFT list
      await fetchNFTs();
      
      alert('NFT purchased successfully!');
    } catch (err) {
      console.error('Error buying NFT:', err);
      alert('Failed to buy NFT: ' + (err.message || 'Unknown error'));
    }
  };

  // Fetch NFTs on component mount
  useEffect(() => {
    if (isConnected) {
      fetchNFTs();
    }
  }, [isConnected]);

  return (
    <div className={styles.container}>
      <Head>
        <title>AI HiveMind Autonomous</title>
        <meta name="description" content="Decentralized AI Economy Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="#">AI HiveMind Autonomous</a>
        </h1>

        <p className={styles.description}>
          A decentralized marketplace for AI-generated assets
        </p>

        {!isConnected ? (
          <button onClick={connect} className={styles.connectButton}>
            Connect Wallet
          </button>
        ) : (
          <div className={styles.walletInfo}>
            <p>Connected: {`${account.substring(0, 6)}...${account.substring(38)}`}</p>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Mint New NFT</h2>
            <form onSubmit={handleMint} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="tokenURI">Token URI:</label>
                <input
                  id="tokenURI"
                  type="text"
                  value={mintForm.tokenURI}
                  onChange={(e) => setMintForm({ ...mintForm, tokenURI: e.target.value })}
                  placeholder="ipfs://..."
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="price">Price (ETH):</label>
                <input
                  id="price"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={mintForm.price}
                  onChange={(e) => setMintForm({ ...mintForm, price: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className={styles.button}>
                Mint NFT
              </button>
            </form>
          </div>

          <div className={styles.card}>
            <h2>Available NFTs</h2>
            {loading ? (
              <p>Loading NFTs...</p>
            ) : nfts.length === 0 ? (
              <p>No NFTs available</p>
            ) : (
              <div className={styles.nftGrid}>
                {nfts.map((nft) => (
                  <div key={nft.tokenId} className={styles.nftCard}>
                    <div className={styles.nftImage}>
                      {nft.tokenURI.startsWith('ipfs://') ? (
                        <img 
                          src={`https://ipfs.io/ipfs/${nft.tokenURI.split('ipfs://')[1]}`} 
                          alt={`NFT ${nft.tokenId}`}
                        />
                      ) : (
                        <div className={styles.placeholderImage}>NFT #{nft.tokenId}</div>
                      )}
                    </div>
                    <div className={styles.nftInfo}>
                      <p>ID: {nft.tokenId}</p>
                      <p>Price: {nft.price} ETH</p>
                      <p>Owner: {`${nft.owner.substring(0, 6)}...${nft.owner.substring(38)}`}</p>
                      {nft.owner.toLowerCase() !== account?.toLowerCase() && (
                        <button 
                          onClick={() => handleBuy(nft.tokenId, nft.price)}
                          className={styles.buyButton}
                        >
                          Buy Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} AI HiveMind Autonomous. All rights reserved.</p>
      </footer>
    </div>
  );
}
