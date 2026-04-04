import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiProvider } from 'wagmi';
import { mainnet, bsc, polygon, base, arbitrum } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const projectId = '4c424a5697793d2581c2053641323f4c';

const metadata = {
  name: 'EVEDEX | Node Terminal',
  description: 'Institutional Node Gateway',
  url: 'https://evedex.network',
  icons: ['https://img.icons8.com/ios-filled/100/06b6d4/shield.png']
};

const chains = [mainnet, bsc, polygon, base, arbitrum];

const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: false,
  enableWalletConnect: true,
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  allWallets: 'SHOW',
  enableExplorer: true,
  themeMode: 'dark'
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
