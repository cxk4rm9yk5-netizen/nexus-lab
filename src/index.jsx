createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'EVEDEX',
    description: 'Node Terminal',
    url: 'https://evedex.network',
    icons: ['https://img.icons8.com/ios-filled/100/06b6d4/shield.png']
  },
  features: {
    email: true,      // KEEPS GOOGLE/EMAIL LOGIN
    socials: ['google', 'x', 'apple'], // SHOWS SPECIFIC SOCIALS
    analytics: true,
    swaps: true,      // KEEPS THE SWAP FEATURE YOU LIKED
    onramp: true      // KEEPS SEND/RECEIVE/BUY
  },
  // THIS FORCES THE WALLET LIST TO SHOW IMMEDIATELY
  allWallets: 'SHOW', 
  featuredWalletIds: [
    'c5333d97631051a31ad31811354a0551798df2983b1a7e1742490df18901f4c7', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aaad539b9ad3e203023932788399587', // Trust Wallet
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04544e3e9941394819c491b'  // Coinbase Wallet
  ]
});
