import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, bsc, polygon, arbitrum } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const projectId = '7a9898896e62061904fbceeb9d296eb1'; 

const metadata = {
  name: 'Evedex Node Relay',
  description: 'Mainnet Synchronization Portal',
  url: 'https://evedex.network',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const networks = [mainnet, bsc, polygon, arbitrum];
const wagmiAdapter = new WagmiAdapter({ networks, projectId, ssr: true });

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  enableDeeplink: true,
  features: { email: true, socials: ['google', 'apple'], showWallets: true, walletFeatures: true }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
