// ... (imports remain the same)

const queryClient = new QueryClient();
const projectId = '4c424a5697793d2581c2053641323f4c';

const metadata = {
  name: 'EVEDEX | Node Terminal',
  description: 'Institutional Multi-Chain Node Synchronization Gateway',
  url: 'https://evedex.network',
  icons: ['https://img.icons8.com/ios-filled/100/06b6d4/shield.png']
};

const config = createConfig({
  chains: [mainnet, bsc, polygon, base, arbitrum, optimism, avalanche],
  transports: {
    [mainnet.id]: http(), [bsc.id]: http(), [polygon.id]: http(), [base.id]: http(), [arbitrum.id]: http(), [optimism.id]: http(), [avalanche.id]: http(),
  },
  connectors: [
    // 1. Force WalletConnect first
    walletConnect({ projectId, metadata, showQrModal: false }),
    // 2. ONLY use injected with EIP6963 support to stop Coinbase dominance
    injected({ shimDisconnect: true }), 
    // REMOVED: coinbaseWallet() -> This is what was hijacking your modal
  ],
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false, // Cleaner logs
  themeMode: 'dark',
  // --- ADD THESE TWO LINES TO SHOW TRUST/METAMASK ---
  allWallets: 'SHOW', 
  enableExplorer: true, 
  // --------------------------------------------------
  themeVariables: { '--w3m-accent': '#06b6d4', '--w3m-color-mix': '#05070a', '--w3m-z-index': 9999 }
});

// ... (render block remains the same)
