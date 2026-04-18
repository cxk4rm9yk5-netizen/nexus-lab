import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, bsc, polygon, arbitrum, optimism, base, avalanche } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// 1. YOUR PROJECT ID
const projectId = '7a9898896e62061904fbceeb9d296eb1'; 

const networks = [mainnet, bsc, polygon, arbitrum, optimism, base, avalanche];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true 
});

// 2. Initialize AppKit with Gmail/Apple ENABLED
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  defaultNetwork: mainnet,
  metadata: {
    name: 'Evedex V2 Protocol', 
    description: 'Evedex Decentralized Exchange Node',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://evedex.network',
    icons: ['https://evedex.network/logo.png']
  },
  features: {
    email: true, // FIXED: Now allows Email login
    socials: ['google', 'apple'], // FIXED: Now shows the buttons you wanted
    emailShowWallets: true,
    swaps: true, 
    onramp: false,
    analytics: true
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#10b981', // Matches your Green Terminal
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
