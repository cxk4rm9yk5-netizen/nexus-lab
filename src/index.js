
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, bsc, polygon } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

// This is the brain of the wallet connection
const config = getDefaultConfig({
  appName: 'Nexus Lab',
  projectId: '788647c234b3f8a61988223d6a9d72c1', // Public Project ID
  chains: [mainnet, bsc, polygon],
  ssr: true,
});

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider theme={darkTheme({
        accentColor: '#06b6d4', // Cyan color to match your theme
        borderRadius: 'large',
      })}>
        <App />
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
