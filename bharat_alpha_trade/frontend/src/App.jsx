import React, { useState, useEffect } from 'react';

export default function App() {
  const [tab, setTab] = useState('copilot');
  const [symbol, setSymbol] = useState('NIFTY');
  const [chainData, setChainData] = useState(null);
  const [brokerStatus, setBrokerStatus] = useState(null);
  const [strategyKey, setStrategyKey] = useState('SHORT_STRADDLE');
  const [strategyResult, setStrategyResult] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [funds, setFunds] = useState(null);
  const [positions, setPositions] = useState([]);

  // Arya AI Options Co-Pilot State
  const [chatQuery, setChatQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [tradeMode, setTradeMode] = useState('paper');
  const [executionMessage, setExecutionMessage] = useState('');
  const [chatLogs, setChatLogs] = useState([
    {
      sender: 'agent',
      agent: 'Arya AI ⚡',
      text: 'Greetings Trader! I am Arya AI, your Options Quantitative Specialist. I calculate Black-Scholes Greeks (Delta, Theta, IV) in real-time. Ask me for strategy recommendations or command me to execute paper/real options trades!'
    }
  ]);

  useEffect(() => {
    fetchBrokerStatus();
    fetchChain('NIFTY');
    fetchStrategies();
    fetchFunds();
  }, []);

  const fetchBrokerStatus = async () => { try { const r = await fetch('/api/broker/status'); setBrokerStatus(await r.json()); } catch(e){} };
  const fetchFunds = async () => { try { const r = await fetch('/api/broker/funds'); setFunds(await r.json()); } catch(e){} };
  const fetchStrategies = async () => { try { const r = await fetch('/api/options/strategies'); const d = await r.json(); setStrategies(d.strategies || []); } catch(e){} };

  const fetchChain = async (sym) => {
    setLoading(true);
    try { const r = await fetch(`/api/options/chain/${sym}`); const d = await r.json(); if(d.status==='success') setChainData(d); } catch(e){}
    setLoading(false);
  };

  const buildStrategy = async () => {
    if(!chainData) return;
    try {
      const r = await fetch('/api/options/strategy', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ strategy_key: strategyKey, spot_price: chainData.spot_price, lot_size: chainData.lot_size, strike_step: chainData.strike_step })
      });
      const d = await r.json();
      if(d.status==='success') setStrategyResult(d.data);
    } catch(e){}
  };

  const executePaperTrade = async () => {
    if(!strategyResult) return;
    try {
      const r = await fetch('/api/options/execute', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ legs: strategyResult.legs, lot_size: strategyResult.lot_size, mode: tradeMode, broker:'fyers' })
      });
      const d = await r.json();
      setExecutionMessage(d.message || 'Trade Executed!');
      fetchPositions();
    } catch(e){ alert('Error: '+e); }
  };

  const handleSendChat = async (e, customPrompt = null) => {
    if(e) e.preventDefault();
    const query = customPrompt || chatQuery;
    if(!query.trim()) return;

    setChatLogs(prev => [...prev, { sender:'user', text: query }]);
    if(!customPrompt) setChatQuery('');
    setChatLoading(true);

    try {
      const r = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query, agent: 'arya' })
      });
      const data = await r.json();
      setChatLogs(prev => [...prev, {
        sender: 'agent',
        agent: 'Arya AI ⚡',
        text: data.reply,
        trade_action: data.trade_action
      }]);
    } catch(err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleExecuteAgentTrade = async (actionObj) => {
    setExecutionMessage('');
    try {
      const r = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: symbol,
          action: 'SELL',
          mode: tradeMode,
          broker: 'fyers',
          strategy: actionObj?.strategy || 'SHORT_STRADDLE',
          qty: 25
        })
      });
      const d = await r.json();
      setExecutionMessage(d.message || 'Agent Trade Filled!');
      fetchPositions();
    } catch(err) {
      console.error(err);
    }
  };

  const fetchPositions = async () => { try { const r = await fetch('/api/broker/positions'); const d = await r.json(); setPositions(d.positions||[]); } catch(e){} };

  const tabs = [
    {id:'copilot', label:'⚡ Arya Options AI Co-Pilot'},
    {id:'chain', label:'Option Chain'},
    {id:'strategy', label:'Strategy Builder'},
    {id:'positions', label:'Positions & P&L'},
  ];

  return (
    <div style={{minHeight:'100vh', display:'flex', flexDirection:'column'}}>
      {/* Header */}
      <header className="glass-panel" style={{borderRadius:0,borderTop:0,borderLeft:0,borderRight:0,padding:'16px 28px'}}>
        <div style={{maxWidth:1400,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:42,height:42,borderRadius:10,background:'linear-gradient(135deg,#FF9800 0%,#FF5722 100%)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 15px rgba(255,152,0,0.4)',fontWeight:900,fontSize:'1.2rem',color:'#000'}}>⚡</div>
            <div>
              <h1 style={{fontSize:'1.4rem',fontWeight:800,background:'linear-gradient(90deg,#FFF 0%,#FF9800 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>BharatAlpha Trade</h1>
              <p style={{fontSize:'0.72rem',color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'0.08em'}}>Options & Futures Trading Terminal (NSE F&O)</p>
            </div>
          </div>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <div className="glass-panel" style={{padding:'6px 14px',fontSize:'0.82rem'}}>
              <span style={{color:'var(--text-secondary)',fontWeight:600,marginRight:6}}>Spot:</span>
              <span className="mono" style={{fontWeight:700,color:'var(--accent-orange)'}}>{symbol} ₹{chainData?.spot_price || '—'}</span>
            </div>
            <select className="search-input" style={{width:140}} value={symbol} onChange={e=>{setSymbol(e.target.value);fetchChain(e.target.value);}}>
              <option value="NIFTY">NIFTY 50</option>
              <option value="BANKNIFTY">BANK NIFTY</option>
            </select>
            <div className="glass-panel" style={{padding:'6px 14px',fontSize:'0.78rem'}}>
              <span style={{color: brokerStatus?.fyers?.connected ? 'var(--bull-green)':'var(--bear-red)',fontWeight:700}}>
                {brokerStatus?.fyers?.connected ? '● Fyers Live':'○ Paper Mode'}
              </span>
            </div>
            <div className="glass-panel" style={{padding:'6px 14px',fontSize:'0.78rem'}}>
              <span style={{color:'var(--accent-orange)',fontWeight:600}}>Margin: ₹{funds?.available_margin?.toLocaleString() || '5,00,000'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav style={{background:'rgba(10,14,22,0.95)',borderBottom:'1px solid var(--panel-border)',padding:'0 28px'}}>
        <div style={{maxWidth:1400,margin:'0 auto',display:'flex',gap:8}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>{setTab(t.id); if(t.id==='positions') fetchPositions();}}
              style={{display:'flex',alignItems:'center',gap:8,padding:'14px 20px',background:'none',border:'none',
                borderBottom: tab===t.id ? '3px solid var(--accent-orange)':'3px solid transparent',
                color: tab===t.id ? 'var(--accent-orange)':'var(--text-secondary)',fontWeight: tab===t.id ? 700:500,fontSize:'0.9rem',cursor:'pointer'}}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main style={{maxWidth:1400,margin:'28px auto',padding:'0 28px',flex:1,width:'100%'}}>

        {/* ARYA AI CO-PILOT TAB */}
        {tab==='copilot' && (
          <div style={{display:'flex',flexDirection:'column',gap:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
              <div>
                <h2 style={{fontSize:'1.4rem',fontWeight:800}}>Arya AI Options Quantitative Assistant</h2>
                <p style={{color:'var(--text-secondary)',fontSize:'0.85rem'}}>Real-time Black-Scholes Greeks analysis, delta-neutral strategies, and 1-click execution.</p>
              </div>

              <div className="glass-panel" style={{padding:6,display:'flex',gap:8}}>
                <button 
                  className={tradeMode==='paper'?'btn-primary':'btn-secondary'} 
                  onClick={()=>setTradeMode('paper')} 
                  style={{padding:'6px 12px',fontSize:'0.8rem'}}
                >
                  📄 Paper Mode (₹5L Capital)
                </button>
                <button 
                  className={tradeMode==='real'?'btn-primary':'btn-secondary'} 
                  onClick={()=>setTradeMode('real')} 
                  style={{padding:'6px 12px',fontSize:'0.8rem',background: tradeMode==='real' ? 'linear-gradient(135deg,#FF9800,#F44336)':'none'}}
                >
                  🔴 Live Broker (Fyers/Zerodha)
                </button>
              </div>
            </div>

            {executionMessage && (
              <div className="glass-panel" style={{padding:12,background:'rgba(0,230,118,0.1)',border:'1px solid var(--bull-green)',color:'var(--bull-green)',fontWeight:700,fontSize:'0.88rem'}}>
                {executionMessage}
              </div>
            )}

            {/* Chat Box */}
            <div className="glass-panel" style={{padding:24,display:'flex',flexDirection:'column',height:480}}>
              <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:16,paddingBottom:16}}>
                {chatLogs.map((m,i)=>(
                  <div key={i} style={{alignSelf: m.sender==='user'?'flex-end':'flex-start',maxWidth:'80%'}}>
                    <div style={{
                      background: m.sender==='user'?'rgba(255,152,0,0.15)':'rgba(20,28,45,0.9)',
                      border: m.sender==='user'?'1px solid rgba(255,152,0,0.4)':'1px solid var(--panel-border)',
                      borderRadius:12,padding:14
                    }}>
                      <div style={{fontSize:'0.75rem',color: m.sender==='user'?'var(--accent-orange)':'#FFC107',fontWeight:700,marginBottom:4}}>
                        {m.sender==='user'?'You':m.agent}
                      </div>
                      <div style={{fontSize:'0.9rem',whiteSpace:'pre-line',lineHeight:1.5}}>
                        {m.text}
                      </div>
                      {m.trade_action && (
                        <div style={{marginTop:12,paddingTop:10,borderTop:'1px solid rgba(255,255,255,0.1)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <span style={{fontSize:'0.8rem',fontWeight:700,color:'var(--accent-orange)'}}>
                            Strategy: {m.trade_action.strategy} ({symbol})
                          </span>
                          <button 
                            className="btn-primary" 
                            style={{padding:'6px 14px',fontSize:'0.8rem',background:'linear-gradient(135deg,#FF9800,#FF5722)'}}
                            onClick={()=>handleExecuteAgentTrade(m.trade_action)}
                          >
                            ⚡ Execute {tradeMode.toUpperCase()} Trade
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && <div style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>Analyzing Options Greeks & IV Rank...</div>}
              </div>

              {/* Suggestions */}
              <div style={{display:'flex',gap:8,paddingBottom:12,overflowX:'auto'}}>
                {[
                  "What option strategy should I run on NIFTY today?",
                  "Recommend an Iron Condor setup",
                  "Show ATM Straddle Greeks & Decay"
                ].map((p,idx)=>(
                  <button key={idx} className="btn-secondary" style={{padding:'4px 10px',fontSize:'0.75rem',whiteSpace:'nowrap'}} onClick={(e)=>handleSendChat(e,p)}>
                    💡 {p}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendChat} style={{display:'flex',gap:8}}>
                <input type="text" className="search-input" placeholder="Ask Arya AI for option strategy suggestions or market questions..." value={chatQuery} onChange={e=>setChatQuery(e.target.value)}/>
                <button type="submit" className="btn-primary" disabled={chatLoading} style={{background:'linear-gradient(135deg,#FF9800,#FF5722)'}}>
                  Ask Arya
                </button>
              </form>
            </div>
          </div>
        )}

        {/* OPTION CHAIN TAB */}
        {tab==='chain' && chainData && (
          <div style={{display:'flex',flexDirection:'column',gap:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <h2 style={{fontSize:'1.4rem',fontWeight:800}}>{chainData.symbol} Live Option Chain</h2>
                <p style={{color:'var(--text-secondary)',fontSize:'0.85rem'}}>Expiry: {chainData.expiry} | DTE: {chainData.days_to_expiry} days | Lot: {chainData.lot_size} | Source: {chainData.source}</p>
              </div>
            </div>
            <div className="glass-panel" style={{padding:0,overflow:'hidden'}}>
              <div style={{overflowX:'auto'}}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th colSpan="6" style={{textAlign:'center',color:'var(--bull-green)',borderRight:'2px solid var(--panel-border)'}}>CALLS</th>
                      <th style={{textAlign:'center',color:'var(--accent-orange)'}}>STRIKE</th>
                      <th colSpan="6" style={{textAlign:'center',color:'var(--bear-red)'}}>PUTS</th>
                    </tr>
                    <tr>
                      <th>OI</th><th>Vol</th><th>IV%</th><th>LTP</th><th>Delta</th><th style={{borderRight:'2px solid var(--panel-border)'}}>Theta</th>
                      <th style={{textAlign:'center'}}>₹</th>
                      <th>Delta</th><th>Theta</th><th>LTP</th><th>IV%</th><th>Vol</th><th>OI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chainData.chain.map((row,i)=>{
                      const isATM = row.moneyness==='ATM';
                      return (
                        <tr key={i} className={isATM?'atm-row':''}>
                          <td className="mono">{(row.ce_oi/1000).toFixed(0)}K</td>
                          <td className="mono">{(row.ce_volume/1000).toFixed(0)}K</td>
                          <td className="mono" style={{color:'var(--accent-orange)'}}>{row.ce_iv}%</td>
                          <td className="mono" style={{fontWeight:700}}>{row.ce_ltp}</td>
                          <td className="mono" style={{color:'var(--bull-green)'}}>{row.ce_delta}</td>
                          <td className="mono" style={{color:'var(--bear-red)',borderRight:'2px solid var(--panel-border)'}}>{row.ce_theta}</td>
                          <td className="mono" style={{textAlign:'center',fontWeight:800,color: isATM?'var(--accent-orange)':'var(--text-primary)',fontSize:'0.9rem'}}>{row.strike}</td>
                          <td className="mono" style={{color:'var(--bull-green)'}}>{row.pe_delta}</td>
                          <td className="mono" style={{color:'var(--bear-red)'}}>{row.pe_theta}</td>
                          <td className="mono" style={{fontWeight:700}}>{row.pe_ltp}</td>
                          <td className="mono" style={{color:'var(--accent-orange)'}}>{row.pe_iv}%</td>
                          <td className="mono">{(row.pe_volume/1000).toFixed(0)}K</td>
                          <td className="mono">{(row.pe_oi/1000).toFixed(0)}K</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* STRATEGY BUILDER TAB */}
        {tab==='strategy' && (
          <div style={{display:'flex',flexDirection:'column',gap:24}}>
            <h2 style={{fontSize:'1.4rem',fontWeight:800}}>Options Strategy Builder & Payoff Analyzer</h2>
            <div style={{display:'grid',gridTemplateColumns:'350px 1fr',gap:24}}>
              <div className="glass-panel" style={{padding:24,display:'flex',flexDirection:'column',gap:16}}>
                <div>
                  <label style={{fontSize:'0.8rem',color:'var(--text-muted)',display:'block',marginBottom:6}}>Select Strategy</label>
                  <select className="search-input" value={strategyKey} onChange={e=>setStrategyKey(e.target.value)}>
                    {strategies.map(s=>(<option key={s.key} value={s.key}>{s.name} — {s.view}</option>))}
                  </select>
                </div>
                <div style={{fontSize:'0.85rem',color:'var(--text-secondary)'}}>{strategies.find(s=>s.key===strategyKey)?.description}</div>
                <div className="glass-panel" style={{padding:12}}>
                  <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Spot Price</div>
                  <div className="mono" style={{fontSize:'1.3rem',fontWeight:800}}>₹{chainData?.spot_price||24600}</div>
                </div>
                <button className="btn-primary" onClick={buildStrategy}>Build & Analyze Strategy</button>
                {strategyResult && (
                  <button className="btn-secondary" onClick={executePaperTrade} style={{borderColor:'var(--accent-orange)'}}>
                    📄 Execute Paper Trade
                  </button>
                )}
              </div>

              {strategyResult ? (
                <div style={{display:'flex',flexDirection:'column',gap:20}}>
                  <div className="glass-panel" style={{padding:24,borderLeft:'4px solid var(--accent-orange)'}}>
                    <h3 style={{fontSize:'1.2rem',fontWeight:800,marginBottom:16}}>{strategyResult.name} — Payoff Analysis</h3>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))',gap:16}}>
                      <div className="glass-panel" style={{padding:14}}>
                        <div style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>Max Profit</div>
                        <div className="mono" style={{fontSize:'1.3rem',fontWeight:800,color:'var(--bull-green)'}}>₹{strategyResult.max_profit?.toLocaleString()}</div>
                      </div>
                      <div className="glass-panel" style={{padding:14}}>
                        <div style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>Max Loss</div>
                        <div className="mono" style={{fontSize:'1.3rem',fontWeight:800,color:'var(--bear-red)'}}>₹{strategyResult.max_loss?.toLocaleString()}</div>
                      </div>
                      <div className="glass-panel" style={{padding:14}}>
                        <div style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>Net Premium</div>
                        <div className="mono" style={{fontSize:'1.3rem',fontWeight:800,color:'var(--accent-orange)'}}>₹{strategyResult.net_premium_total}</div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel" style={{padding:24}}>
                    <h4 style={{fontSize:'1rem',fontWeight:700,marginBottom:12}}>Payoff at Expiry</h4>
                    <div style={{height:200,display:'flex',alignItems:'flex-end',gap:2,background:'rgba(5,8,14,0.6)',borderRadius:8,padding:16,position:'relative'}}>
                      {strategyResult.payoff_curve?.map((pt,i)=>{
                        const maxAbs = Math.max(...strategyResult.payoff_curve.map(p=>Math.abs(p.pnl)),1);
                        const h = Math.abs(pt.pnl)/maxAbs*80;
                        return(<div key={i} title={`₹${pt.price}: P&L ₹${pt.pnl}`} style={{flex:1,height:`${h}%`,background:pt.pnl>=0?'var(--bull-green)':'var(--bear-red)',opacity:0.8,borderRadius:1}}/>);
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-panel" style={{padding:40,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)'}}>
                  Select a strategy and click "Build & Analyze" to see payoff analysis.
                </div>
              )}
            </div>
          </div>
        )}

        {/* POSITIONS TAB */}
        {tab==='positions' && (
          <div style={{display:'flex',flexDirection:'column',gap:24}}>
            <h2 style={{fontSize:'1.4rem',fontWeight:800}}>Open Positions & P&L</h2>
            {positions.length > 0 ? (
              <div className="glass-panel" style={{padding:0,overflow:'hidden'}}>
                <table className="custom-table">
                  <thead><tr><th>Action</th><th>Type</th><th>Strike</th><th>Qty</th><th>Entry Premium</th><th>Status</th><th>Time</th></tr></thead>
                  <tbody>
                    {positions.map((p,i)=>(
                      <tr key={i}>
                        <td><span className={`badge ${p.action==='SELL'?'badge-bear':'badge-bull'}`}>{p.action}</span></td>
                        <td className="mono">{p.type}</td>
                        <td className="mono" style={{fontWeight:700}}>₹{p.strike}</td>
                        <td className="mono">{p.qty}</td>
                        <td className="mono">₹{p.entry_premium || p.premium}</td>
                        <td><span className="badge badge-gold">{p.status}</span></td>
                        <td style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{p.time || p.timestamp?.slice(0,19)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="glass-panel" style={{padding:40,textAlign:'center',color:'var(--text-muted)'}}>
                No open positions. Execute a strategy from the Strategy Builder or Arya AI tab.
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{background:'rgba(5,8,14,0.95)',borderTop:'1px solid var(--panel-border)',padding:'20px 28px',textAlign:'center',color:'var(--text-muted)',fontSize:'0.8rem'}}>
        BharatAlpha Trade ⚡ — Options & Futures Trading Terminal | Fyers + Zerodha Broker Integration
      </footer>
    </div>
  );
}
