import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, bsc, polygon } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const projectId = '4c424a5697793d2581c2053641323f4c';
const networks = [mainnet, bsc, polygon];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'EVEDEX',
    description: 'Node Terminal',
    url: 'https://evedex.network',
    icons: ['https://img.icons8.com/ios-filled/100/06b6d4/shield.png']
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
