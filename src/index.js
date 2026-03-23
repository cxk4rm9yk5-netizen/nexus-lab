import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiProvider } from 'wagmi';
import { mainnet, bsc, polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// High-priority Project ID for global wallet access
const projectId = '762963167f2e1e07b663b46990479d23'; 

const chains = [mainnet, bsc, polygon];
const metadata = {
  name: 'NEXUS LAB',
  description: 'Technical Gateway',
  url: 'https://nexus-lab-lxr9.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const config = defaultWagmiConfig({ 
  chains, 
  projectId, 
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
});

createWeb3Modal({ 
  wagmiConfig: config, 
  projectId, 
  enableAnalytics: true,
  themeMode: 'dark',
  featuredWalletIds: [
    'c57ca71ada5118a598b04311fe6d6d19e321632727b86e8a84b2826372d5c94d', // Trust
    '4622a2b2d6ad13375050c9b222a773d840c61143899f8260407f354a9388f615', // MetaMask
    'efbb60514041d08794c4897f1cc602c38c6426371f40d7c080f557257e1030e2', // Phantom
  ]
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </WagmiProvider>
);
