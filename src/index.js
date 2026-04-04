import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiProvider } from 'wagmi';
import * as chains from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const projectId = '4c424a5697793d2581c2053641323f4c';

const metadata = {
  name: 'EVEDEX',
  description: 'Node Terminal',
  url: 'https://evedex.network',
  icons: ['https://img.icons8.com/ios-filled/100/06b6d4/shield.png']
};

const config = defaultWagmiConfig({
  chains: [chains.mainnet, chains.bsc, chains.polygon],
  projectId,
  metadata,
  enableInjected: true,
  enableCoinbase: false,
  enableWalletConnect: true,
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
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
