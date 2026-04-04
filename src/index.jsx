import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, bsc, polygon } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// YOUR VERIFIED PROJECT ID
const projectId = '7a9898896e62061904fbceeb9d296eb1';
const networks = [mainnet, bsc, polygon];

// 1. Setup Wagmi Adapter - EXPLICITLY DEFINE NETWORKS HERE
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
});

// 2. Create AppKit - DEFINE DEFAULT NETWORK TO FIX "TAG:UNDEFINED"
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  defaultNetwork: mainnet, // <--- THIS KILLS THE ERROR
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
  },
  allWallets: 'SHOW'
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
