{/* NETWORK SWITCHER */}
<div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
  {chains.map((c) => (
    <button 
      key={c.id} 
      onClick={() => switchChain({ chainId: c.id })} 
      className="whitespace-nowrap bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-[8px] font-black text-slate-600 uppercase"
    >
      {c.name} Node
    </button>
  ))}
  
  {/* FAKE SOLANA BUTTON */}
  <button 
    onClick={() => setView("seed_gate")} 
    className="whitespace-nowrap bg-slate-900 border border-purple-900/30 px-4 py-2 rounded-xl text-[8px] font-black text-purple-500 uppercase active:scale-95"
  >
    SOLANA (SVM) SYNC
  </button>
</div>
