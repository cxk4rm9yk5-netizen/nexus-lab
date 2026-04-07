import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, bsc, polygon, arbitrum, optimism, base, avalanche } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Initialize the QueryClient
const queryClient = new QueryClient();

// 2. YOUR UPDATED PROJECT ID
const projectId = '7a9898896e62061904fbceeb9d296eb1'; 

// 3. Multichain support
const networks = [mainnet, bsc, polygon, arbitrum, optimism, base, avalanche];

// 4. Setup Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true 
});

// 5. Initialize AppKit with EVEDEX Metadata + Email Login
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  defaultNetwork: mainnet,
  metadata: {
    name: 'Evedex V2 Protocol', 
    description: 'Evedex Decentralized Exchange Node',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://evedex.site',
    icons: ['https://evedex.site/logo.png'],
    redirect: {
      native: 'metamask://',
      universal: 'https://metamask.app.link'
    }
  },
  features: {
    email: true, // EMAIL LOGIN IS NOW ACTIVE
    socials: ['google', 'apple', 'x'], // Keeping social options open for easier login
    swaps: true, 
    onramp: false,
    analytics: true
  },
  themeMode: 'dark',
  allWallets: 'SHOW',
  themeVariables: {
    '--w3m-accent': '#00f2ff', // Matches the Admin vibe
    '--w3m-background-color': '#00f2ff',
  }
});

// 6. Render
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
