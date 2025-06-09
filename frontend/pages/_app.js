import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { MetaMaskProvider } from '../hooks/useMetaMask';
import '../styles/globals.css';

function getLibrary(provider) {
  return new Web3Provider(provider);
}

function MyApp({ Component, pageProps }) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <MetaMaskProvider>
        <Component {...pageProps} />
      </MetaMaskProvider>
    </Web3ReactProvider>
  );
}

export default MyApp;
