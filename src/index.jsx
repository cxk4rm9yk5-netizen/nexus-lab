import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, bsc, polygon } from '@reown/appkit/networks';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const projectId = '7a9898896e62061904fbceeb9d296eb1';
const networks = [mainnet, bsc, polygon];

// 1. Setup the Wagmi Adapter with explicit SSR support
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
});

// 2. Configure AppKit with the "Redirect" fix
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  defaultNetwork: mainnet,
  metadata: {
    name: 'EVEDEX',
    description: 'RPC Terminal',
    url: 'https://connect1.vercel.app', // Using your current working URL
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  },
  features: {
    email: true,
    socials: ['google', 'x', 'apple'],
    swaps: true,
    onramp: true
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <WagmiProvider config={wagmiAdapter.wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </WagmiProvider>
);
