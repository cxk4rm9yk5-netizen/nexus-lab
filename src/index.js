import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiProvider } from 'wagmi';
import { mainnet, bsc, polygon, base, arbitrum } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// REPLACE THIS WITH YOUR ACTUAL PROJECT ID FROM REOWN DASHBOARD
const projectId = '4c424a5697793d2581c2053641323f4c';

const metadata = {
  name: 'EVEDEX | Node Terminal',
  description: 'Institutional Multi-Chain Node Synchronization Gateway',
  url: 'https://evedex.network',
  icons: ['https://img.icons8.com/ios-filled/100/06b6d4/shield.png']
};

const chains = [mainnet, bsc, polygon, base, arbitrum];

const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: false, // KILLS THE COINBASE HIJACK
  enableWalletConnect: true,
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  allWallets: 'SHOW', // FORCES TRUST/METAMASK SEARCH
  enableExplorer: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#06b6d4',
    '--w3m-color-mix': '#05070a',
    '--w3m-z-index': 9999
  },
  featuredWalletIds: [
    'c57ca40633ba7d598d0a11a76813616e', // MetaMask
    '4622a2b3d6bc5d963e07d79ef51d1618'  // Trust Wallet
  ]
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
