import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createWeb3Modal, defaultConfig } from '@web3modal/wagmi/react'; // Updated import
import { WagmiProvider } from 'wagmi';
import { bsc, mainnet, polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Your Official Project ID
const projectId = '4c424a5697793d2581c205364188b49e'; 

const metadata = {
  name: 'Nexus Lab',
  description: 'Technical Gateway',
  url: 'https://nexus-lab-lxr9.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [mainnet, bsc, polygon];

// Using defaultConfig instead of defaultWagmiConfig to stop the error
const config = defaultConfig({ 
  metadata,
  projectId,
  chains,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true
});

createWeb3Modal({ 
  wagmiConfig: config, 
  projectId, 
  enableAnalytics: true,
  themeMode: 'dark' 
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </WagmiProvider>
);
