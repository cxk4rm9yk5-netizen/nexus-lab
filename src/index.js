import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// THIS IS THE SPECIFIC PATH FOR VERSION 4.x
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react/config';

import { WagmiProvider } from 'wagmi';
import { bsc, mainnet, polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const projectId = '4c424a5697793d2581c205364188b49e'; 

const metadata = {
  name: 'Nexus Lab',
  description: 'Technical Gateway',
  url: 'https://nexus-lab-lxr9.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [mainnet, bsc, polygon];
const config = defaultWagmiConfig({ chains, projectId, metadata });

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
