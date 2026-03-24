import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { http, createConfig, WagmiProvider } from 'wagmi';
import { mainnet, bsc, polygon } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = '4c424a5697793d2581c205364188b49e'; 

const metadata = {
  name: 'Nexus Lab',
  description: 'Technical Gateway',
  url: 'https://nexus-lab-lxr9.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

// 2. Create wagmiConfig with Explicit Connectors
const chains = [mainnet, bsc, polygon];
const config = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
  },
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({ appName: metadata.name }),
  ],
});

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Required for All Wallets directory
  themeMode: 'dark',
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </WagmiProvider>
);
