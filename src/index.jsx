import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, bsc, polygon } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// UPDATED PROJECT ID FROM YOUR SCREENSHOT
const projectId = '7a9898896e62061904fbceeb9d296eb1';
const networks = [mainnet, bsc, polygon];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'EVEDEX',
    description: 'Node Terminal',
    url: 'https://evedex.network',
    icons: ['https://img.icons8.com/ios-filled/100/06b6d4/shield.png']
  },
  features: {
    email: true,
    socials: ['google', 'x', 'apple'],
    analytics: true,
    swaps: true,
    onramp: true
  },
  allWallets: 'SHOW',
  featuredWalletIds: [
    'c5333d97631051a31ad31811354a0551798df2983b1a7e1742490df18901f4c7', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aaad539b9ad3e203023932788399587', // Trust Wallet
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04544e3e9941394819c491b'  // Coinbase Wallet
  ]
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <WagmiProvider config={wagmiAdapter.wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </WagmiProvider>
);
