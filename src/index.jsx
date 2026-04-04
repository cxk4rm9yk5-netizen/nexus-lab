import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, bsc, polygon } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// VERIFIED ID FROM YOUR SCREENSHOT
const projectId = '7a9898896e62061904fbceeb9d296eb1';
const networks = [mainnet, bsc, polygon];

// 1. Setup Wagmi Adapter (Simplified for Mobile Handshake)
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false // Setting to false can help with mobile Safari redirects
});

// 2. Create AppKit
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'EVEDEX',
    description: 'Node Terminal',
    url: 'https://evedex.network',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  },
  features: {
    email: true,
    socials: ['google', 'x', 'apple'],
    analytics: true,
    swaps: true,
    onramp: true
  }
});

// 3. Render App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <WagmiProvider config={wagmiAdapter.wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </WagmiProvider>
);
