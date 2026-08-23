import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, ShieldAlert, Zap, Search, 
  BarChart2, Filter, Award, Target, Calculator, PieChart, Activity, RefreshCw,
  Coins, Landmark, Percent, Layers, Bot, Send, CheckCircle2, Play, AlertTriangle
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('agent_copilot');
  const [searchTicker, setSearchTicker] = useState('RELIANCE');
  const [stockData, setStockData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [screenerData, setScreenerData] = useState(null);
  const [pulseData, setPulseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [screenerFilter, setScreenerFilter] = useState('long_term');
  const [screenerUniverse, setScreenerUniverse] = useState('DEFAULT');
  
  // Mutual Funds state
  const [mfCategory, setMfCategory] = useState('ALL');
  const [mfData, setMfData] = useState(null);

  // Commodities & Bonds state
  const [commBondsData, setCommBondsData] = useState(null);

  // SIP Calculator state
  const [sipMonthly, setSipMonthly] = useState(25000);
  const [sipTenure, setSipTenure] = useState(15);
  const [sipReturn, setSipReturn] = useState(15.0);
  const [sipStepup, setSipStepup] = useState(10.0);
  const [sipResult, setSipResult] = useState(null);

  // Portfolio Allocation state
  const [allocAge, setAllocAge] = useState(32);
  const [allocRisk, setAllocRisk] = useState('MODERATE');
  const [allocResult, setAllocResult] = useState(null);

  // AI Agent Co-Pilot state
  const [selectedAgent, setSelectedAgent] = useState('auto');
  const [agentQuery, setAgentQuery] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentSuggestions, setAgentSuggestions] = useState(null);
  const [executionMode, setExecutionMode] = useState('paper'); // paper or real
  const [tradeMessage, setTradeMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'agent',
      agent: 'chanakya',
      name: 'Chanakya AI 📈',
      text: 'Welcome! I am Chanakya AI, your 50-Year Veteran Investment & Wealth Strategist. Ask me any question regarding stock valuation, mutual funds, gold allocation, or request an instant trade execution!'
    }
  ]);

  // Backtester state
  const [btTicker, setBtTicker] = useState('TATAMOTORS');
  const [btStrategy, setBtStrategy] = useState('EMA_CROSSOVER');
  const [btPeriod, setBtPeriod] = useState('2y');
  const [btResult, setBtResult] = useState(null);
  const [btLoading, setBtLoading] = useState(false);

  // Position Calculator state
  const [calcCapital, setCalcCapital] = useState(500000);
  const [calcRiskPct, setCalcRiskPct] = useState(1.5);
  const [calcEntry, setCalcEntry] = useState(1250);
  const [calcStopLoss, setCalcStopLoss] = useState(1190);
  const [calcResult, setCalcResult] = useState(null);

  // Initial Data Fetch
  useEffect(() => {
    fetchMarketPulse();
    fetchScreener('DEFAULT');
    fetchStockDetails('RELIANCE');
    fetchMutualFunds('ALL');
    fetchCommoditiesBonds();
    fetchSipCalculation(25000, 15, 15.0, 10.0);
    fetchPortfolioAllocation(32, 'MODERATE');
    fetchAgentSuggestions();
  }, []);

  const fetchMarketPulse = async () => {
    try {
      const res = await fetch('/api/market-pulse');
      const data = await res.json();
      setPulseData(data);
    } catch (e) { console.error('Pulse fetch error:', e); }
  };

  const fetchScreener = async (universe = 'DEFAULT') => {
    setLoading(true);
    setScreenerData(null); // Clear old data to prevent UI ghosting
    try {
      const res = await fetch(`/api/screener?universe=${universe}`);
      const data = await res.json();
      setScreenerData(data.data);
    } catch (e) { console.error('Screener fetch error:', e); }
    finally { setLoading(false); }
  };

  const fetchStockDetails = async (tickerSymbol) => {
    const cleanSym = tickerSymbol.trim().toUpperCase();
    setSearchTicker(cleanSym);
    setLoading(true);
    try {
      const res = await fetch(`/api/stock/${cleanSym}`);
      const data = await res.json();
      if (data.status === 'success') {
        setStockData(data);
        fetchStockChart(cleanSym);
      }
    } catch (e) { console.error('Stock detail error:', e); }
    finally { setLoading(false); }
  };

  const fetchStockChart = async (tickerSymbol) => {
    try {
      const res = await fetch(`/api/stock/${tickerSymbol}/chart?period=6m`);
      const data = await res.json();
      if (data.status === 'success') setChartData(data.chart || []);
    } catch (e) { console.error('Chart fetch error:', e); }
  };

  const fetchMutualFunds = async (cat) => {
    try {
      const res = await fetch(`/api/invest/mutual-funds?category=${cat}`);
      const data = await res.json();
      setMfData(data);
    } catch (e) { console.error('MF fetch error:', e); }
  };

  const fetchCommoditiesBonds = async () => {
    try {
      const res = await fetch('/api/invest/commodities-bonds');
      const data = await res.json();
      setCommBondsData(data);
    } catch (e) { console.error('CommBonds fetch error:', e); }
  };

  const fetchSipCalculation = async (m, t, r, s) => {
    try {
      const res = await fetch('/api/invest/sip-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthly_sip: parseFloat(m), tenure_years: parseInt(t), expected_cagr_pct: parseFloat(r), stepup_pct: parseFloat(s) })
      });
      const data = await res.json();
      setSipResult(data);
    } catch (e) { console.error('SIP calc error:', e); }
  };

  const fetchPortfolioAllocation = async (age, risk) => {
    try {
      const res = await fetch('/api/invest/portfolio-allocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age: parseInt(age), risk_profile: risk })
      });
      const data = await res.json();
      setAllocResult(data);
    } catch (e) { console.error('Alloc fetch error:', e); }
  };

  const fetchAgentSuggestions = async () => {
    try {
      const res = await fetch('/api/agent/suggestions');
      const data = await res.json();
      setAgentSuggestions(data);
    } catch (e) { console.error('Agent suggestions error:', e); }
  };

  const handleSendAgentQuery = async (e, customQuery = null) => {
    if (e) e.preventDefault();
    const queryToSubmit = customQuery || agentQuery;
    if (!queryToSubmit.trim()) return;

    // Add user message to history
    const userMsg = { sender: 'user', text: queryToSubmit };
    setChatHistory((prev) => [...prev, userMsg]);
    if (!customQuery) setAgentQuery('');
    setAgentLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToSubmit, agent: selectedAgent, capital: parseFloat(calcCapital) })
      });
      const data = await res.json();
      
      const agentMsg = {
        sender: 'agent',
        agent: data.agent_info?.name || 'BharatAlpha AI',
        text: data.reply,
        actionable_trade: data.actionable_trade
      };
      setChatHistory((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error('Agent query error:', err);
    } finally {
      setAgentLoading(false);
    }
  };

  const handleExecuteAgentTrade = async (tradeObj) => {
    setTradeMessage('');
    try {
      const res = await fetch('/api/agent/execute-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: tradeObj.symbol || 'chanakya',
          action: tradeObj.action || 'BUY',
          symbol: tradeObj.symbol || 'RELIANCE',
          mode: executionMode,
          qty: tradeObj.suggested_qty || 10,
          entry_price: tradeObj.entry_price || 0
        })
      });
      const data = await res.json();
      setTradeMessage(data.message);
    } catch (err) {
      console.error('Execute error:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTicker.trim()) {
      fetchStockDetails(searchTicker.trim());
      setActiveTab('terminal');
    }
  };

  const handleRunBacktest = async (e) => {
    e.preventDefault();
    setBtLoading(true);
    try {
      const res = await fetch(`/api/backtest?ticker=${btTicker}&strategy=${btStrategy}&period=${btPeriod}`);
      const data = await res.json();
      if (data.status === 'success') setBtResult(data.data);
    } catch (e) { console.error('Backtest error:', e); }
    finally { setBtLoading(false); }
  };

  const handleCalculatePosition = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/position-size', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capital: parseFloat(calcCapital), risk_tolerance_pct: parseFloat(calcRiskPct), entry_price: parseFloat(calcEntry), stop_loss_price: parseFloat(calcStopLoss) })
      });
      const data = await res.json();
      if (data.status === 'success') setCalcResult(data);
    } catch (e) { console.error('Calc error:', e); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '16px 28px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #00F0FF 0%, #0072FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)' }}>
              <Zap size={24} color="#000" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(90deg, #FFFFFF 0%, #00F0FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                BharatAlpha Invest 📈
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Autonomous Multi-Agent Stock Market Intelligence & Wealth Hub
              </p>
            </div>
          </div>

          {/* Search Form & Quick Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: '1 1 320px', maxWidth: 480 }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, width: '100%' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input 
                  type="text"
                  className="search-input"
                  placeholder="Search NSE stock (e.g. SBIN, TCS, INFY, RELIANCE)..."
                  value={searchTicker}
                  onChange={(e) => setSearchTicker(e.target.value)}
                  style={{ paddingLeft: 38 }}
                />
              </div>
              <button type="submit" className="btn-primary">Analyze</button>
            </form>
            
            {/* Quick Stock Chips */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>⚡ Quick:</span>
              {['SBIN', 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS', 'ICICIBANK', 'DIXON', 'BHARTIARTL', 'ITC'].map((stk) => (
                <button
                  key={stk}
                  type="button"
                  onClick={() => {
                    fetchStockDetails(stk);
                    setActiveTab('terminal');
                  }}
                  className="btn-secondary"
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    borderRadius: 4,
                    background: searchTicker.toUpperCase() === stk ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: searchTicker.toUpperCase() === stk ? '1px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.1)',
                    color: searchTicker.toUpperCase() === stk ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {stk}
                </button>
              ))}
            </div>
          </div>

          {/* Indices Quick Bar */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {pulseData?.indices?.map((idx) => (
              <div key={idx.symbol} className="glass-panel" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600, marginRight: 6 }}>{idx.name}:</span>
                <span className="mono" style={{ fontWeight: 700 }}>₹{idx.price}</span>
                <span className="mono" style={{ color: idx.change_pct >= 0 ? 'var(--bull-green)' : 'var(--bear-red)', marginLeft: 6, fontWeight: 700 }}>
                  {idx.change_pct >= 0 ? `+${idx.change_pct}%` : `${idx.change_pct}%`}
                </span>
              </div>
            ))}
          </div>

        </div>
      </header>

      {/* Main Navigation Tabs */}
      <nav style={{ background: 'rgba(10, 14, 22, 0.95)', borderBottom: '1px solid var(--panel-border)', padding: '0 28px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {[
            { id: 'agent_copilot', label: '🤖 AI Agent Co-Pilot', icon: Bot },
            { id: 'screener', label: 'AI Signal Screener', icon: Filter },
            { id: 'terminal', label: 'Stock Research Terminal', icon: BarChart2 },
            { id: 'mutual_funds', label: 'Mutual Funds', icon: Layers },
            { id: 'commodities_bonds', label: 'Gold, Silver & Bonds', icon: Coins },
            { id: 'wealth_planner', label: 'SIP & Wealth Allocator', icon: PieChart },
            { id: 'pulse', label: 'Market Pulse', icon: Activity },
            { id: 'backtester', label: 'Strategy Backtester', icon: Target },
            { id: 'calculator', label: 'Position Sizing Cockpit', icon: Calculator },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ maxWidth: 1400, margin: '28px auto', padding: '0 28px', flex: 1, width: '100%' }}>

        {/* TAB 0: AI AGENT CO-PILOT (NEW) */}
        {activeTab === 'agent_copilot' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Header & Execution Mode Selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Autonomous AI Agent Intelligence Hub</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Ask questions, receive instant suggestions, and direct AI agents to execute Paper or Real Broker Trades.
                </p>
              </div>

              {/* Execution Mode Toggle */}
              <div className="glass-panel" style={{ padding: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: 6 }}>Trade Execution Mode:</span>
                <button
                  onClick={() => setExecutionMode('paper')}
                  className={executionMode === 'paper' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  📄 Paper Mode (Virtual ₹5L)
                </button>
                <button
                  onClick={() => setExecutionMode('real')}
                  className={executionMode === 'real' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '6px 14px', fontSize: '0.8rem', background: executionMode === 'real' ? 'linear-gradient(135deg, #FF9800, #F44336)' : 'none' }}
                >
                  🔴 Live Broker (Fyers / Zerodha)
                </button>
              </div>
            </div>

            {/* Proactive Agent Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {[
                { id: 'chanakya', name: 'Chanakya AI 📈', role: 'Wealth Strategist', data: agentSuggestions?.chanakya, color: '#00F0FF' },
                { id: 'arya', name: 'Arya AI ⚡', role: 'Options Trader', data: agentSuggestions?.arya, color: '#FF9800' },
                { id: 'vikram', name: 'Vikram AI 🏹', role: 'Swing Momentum', data: agentSuggestions?.vikram, color: '#00E676' },
                { id: 'kautilya', name: 'Kautilya AI 🛡️', role: 'Risk Guardian', data: agentSuggestions?.kautilya, color: '#E91E63' },
              ].map((ag) => (
                <div key={ag.id} className="glass-panel" style={{ padding: 16, borderLeft: `4px solid ${ag.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: ag.color }}>{ag.name}</div>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{ag.role}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#FFF', fontWeight: 700, marginTop: 8 }}>
                    {ag.data?.title || 'Active Market Scan'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    {ag.data?.reason}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <span className="mono" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{ag.data?.ticker}: {ag.data?.action}</span>
                    <button
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => handleSendAgentQuery(null, `Tell me more about ${ag.data?.ticker} suggestion`)}
                    >
                      Ask {ag.id}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Notification Banner for Executed Trades */}
            {tradeMessage && (
              <div className="glass-panel" style={{ padding: 14, background: 'rgba(0, 230, 118, 0.1)', border: '1px solid var(--bull-green)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircle2 size={20} color="var(--bull-green)" />
                <span style={{ color: 'var(--bull-green)', fontWeight: 700, fontSize: '0.9rem' }}>{tradeMessage}</span>
              </div>
            )}

            {/* Chat Interface Container */}
            <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', height: 500 }}>
              
              {/* Agent Selector Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--panel-border)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Specialist Agent:</span>
                {[
                  { id: 'auto', label: '🤖 Auto-Routing Engine' },
                  { id: 'chanakya', label: '📈 Chanakya (Wealth)' },
                  { id: 'arya', label: '⚡ Arya (Options)' },
                  { id: 'vikram', label: '🏹 Vikram (Swing)' },
                  { id: 'kautilya', label: '🛡️ Kautilya (Risk)' }
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAgent(a.id)}
                    className={selectedAgent === a.id ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              {/* Chat Message Scrollable Box */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {chatHistory.map((msg, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' 
                    }}
                  >
                    <div 
                      style={{ 
                        maxWidth: '80%', 
                        background: msg.sender === 'user' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(20, 28, 45, 0.9)', 
                        border: msg.sender === 'user' ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid var(--panel-border)', 
                        borderRadius: 12, 
                        padding: 16 
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: msg.sender === 'user' ? 'var(--accent-cyan)' : 'var(--warning-gold)', fontWeight: 700, marginBottom: 6 }}>
                        {msg.sender === 'user' ? 'You' : msg.agent}
                      </div>
                      <div style={{ fontSize: '0.9rem', whiteSpace: 'pre-line', lineHeight: 1.5, color: '#FFF' }}>
                        {msg.text}
                      </div>

                      {/* Actionable Trade Execution Button */}
                      {msg.actionable_trade && (
                        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                          <div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Action: </span>
                            <span className="mono" style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>
                              {msg.actionable_trade.action || msg.actionable_trade.type} {msg.actionable_trade.symbol}
                            </span>
                          </div>
                          <button
                            onClick={() => handleExecuteAgentTrade(msg.actionable_trade)}
                            className="btn-primary"
                            style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            <Play size={14} /> Execute {executionMode.toUpperCase()} Trade
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {agentLoading && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <RefreshCw size={16} className="spin" /> Analyzing market quantitative models...
                  </div>
                )}
              </div>

              {/* Quick Suggestion Prompts */}
              <div style={{ display: 'flex', gap: 8, paddingBottom: 12, overflowX: 'auto' }}>
                {[
                  "Suggest top stock for long term",
                  "What option strategy should I run on NIFTY today?",
                  "Show VCP breakout setup",
                  "Audit my portfolio risk & sizing"
                ].map((prompt, i) => (
                  <button
                    key={i}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    onClick={(e) => handleSendAgentQuery(e, prompt)}
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendAgentQuery} style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Ask Chanakya, Arya, Vikram or Kautilya AI anything..." 
                  value={agentQuery} 
                  onChange={(e) => setAgentQuery(e.target.value)} 
                />
                <button type="submit" className="btn-primary" disabled={agentLoading} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Send size={16} /> Ask
                </button>
              </form>

            </div>
          </div>
        )}

        {/* TAB 1: AI SCREENER */}
        {activeTab === 'screener' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Institutional AI Screener</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Real-time quantitative screening combining 50-year fundamental quality scoring & Minervini VCP momentum setups.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
                <select 
                  className="search-input" 
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
                  value={screenerUniverse}
                  onChange={(e) => {
                    setScreenerUniverse(e.target.value);
                    fetchScreener(e.target.value);
                  }}
                >
                  <option value="DEFAULT">Default Universe (20 Stocks)</option>
                  <option value="NIFTY_50">Nifty 50</option>
                  <option value="NIFTY_NEXT_50">Nifty Next 50</option>
                  <option value="NIFTY_MIDCAP">Nifty Midcap</option>
                  <option value="NIFTY_SMALLCAP">Nifty Smallcap</option>
                  <option value="NIFTY_MICROCAP">Nifty Microcap</option>
                  <option value="DYNAMIC_5000CR">All Stocks &gt; ₹5000 Cr</option>
                  <option value="SECTORAL_IT">IT Sector</option>
                  <option value="SECTORAL_BANK">Banking Sector</option>
                  <option value="SECTORAL_AUTO">Auto Sector</option>
                  <option value="SECTORAL_PHARMA">Pharma Sector</option>
                  <option value="SECTORAL_INFRA">Infra Sector</option>
                </select>
                <div style={{ height: '24px', width: '1px', background: 'var(--panel-border)' }}></div>
                <button
                  onClick={() => setScreenerFilter('long_term')}
                  className={screenerFilter === 'long_term' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <Award size={16} /> Long-Term Investing (Compounders)
                </button>
                <button
                  onClick={() => setScreenerFilter('short_term')}
                  className={screenerFilter === 'short_term' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <TrendingUp size={16} /> Short-Term Trading (Swing & VCP)
                </button>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Stock & Sector</th>
                      <th>Current Price</th>
                      <th>Conviction</th>
                      <th>Veteran Score</th>
                      <th>Category / Setup</th>
                      <th>Action</th>
                      <th>Entry Zone</th>
                      <th>Target 1 / Target 2</th>
                      <th>Stop Loss</th>
                      <th>R:R</th>
                      <th>Analyze</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(screenerFilter === 'long_term' ? screenerData?.long_term_picks : screenerData?.short_term_picks)?.map((item) => (
                      <tr key={item.ticker}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFF' }}>{item.ticker}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.sector}</div>
                        </td>
                        <td className="mono" style={{ fontWeight: 700 }}>
                          ₹{item.current_price}
                          <span style={{ fontSize: '0.75rem', color: item.change_pct >= 0 ? 'var(--bull-green)' : 'var(--bear-red)', marginLeft: 6 }}>
                            {item.change_pct >= 0 ? `+${item.change_pct}%` : `${item.change_pct}%`}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: 'var(--warning-gold)', letterSpacing: 2, fontWeight: 700 }}>
                            {'★'.repeat(item.conviction_stars)}{'☆'.repeat(5 - item.conviction_stars)}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 36, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${item.veteran_score}%`, height: '100%', background: item.veteran_score >= 70 ? 'var(--bull-green)' : 'var(--accent-cyan)' }} />
                            </div>
                            <span className="mono" style={{ fontWeight: 700 }}>{item.veteran_score}</span>
                          </div>
                        </td>
                        <td>
                          {item.vcp_active ? (
                            <span className="badge badge-gold">VCP BREAKOUT</span>
                          ) : (
                            <span className="badge badge-cyan">{item.category?.replace(/_/g, ' ')}</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${item.action?.includes('BUY') ? 'badge-bull' : 'badge-gold'}`}>
                            {item.action?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="mono" style={{ fontSize: '0.85rem' }}>{item.entry_zone}</td>
                        <td className="mono" style={{ fontSize: '0.85rem', color: 'var(--bull-green)', fontWeight: 600 }}>
                          ₹{item.target_1} / ₹{item.target_2}
                        </td>
                        <td className="mono" style={{ fontSize: '0.85rem', color: 'var(--bear-red)', fontWeight: 600 }}>
                          ₹{item.stop_loss}
                        </td>
                        <td className="mono" style={{ fontWeight: 700 }}>{item.risk_reward}</td>
                        <td>
                          <button
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => {
                              setSearchTicker(item.ticker);
                              fetchStockDetails(item.ticker);
                              setActiveTab('terminal');
                            }}
                          >
                            View Blueprint
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STOCK RESEARCH TERMINAL */}
        {activeTab === 'terminal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {loading ? (
              <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
                <RefreshCw size={32} className="spin" color="var(--accent-cyan)" />
                <p style={{ marginTop: 12, color: 'var(--text-secondary)' }}>Synthesizing 50-Year Veteran Market Intelligence for {searchTicker}...</p>
              </div>
            ) : stockData ? (
              <>
                <div className="glass-panel" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stockData.company_name}</h2>
                      <span className="badge badge-cyan">{stockData.ticker}</span>
                      <span className="badge badge-gold">{stockData.fundamentals?.sector}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                      Industry: {stockData.fundamentals?.industry} | Market Cap: ₹{stockData.fundamentals?.market_cap_cr} Cr
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Price</div>
                      <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800 }}>₹{stockData.technicals?.current_price}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Day Change</div>
                      <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: stockData.technicals?.change_pct >= 0 ? 'var(--bull-green)' : 'var(--bear-red)' }}>
                        {stockData.technicals?.change_pct >= 0 ? `+${stockData.technicals?.change_pct}%` : `${stockData.technicals?.change_pct}%`}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Veteran Score</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          {stockData.trade_plan?.veteran_score}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24 }}>
                  <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>6-Month Technical Trend & Moving Averages</h3>
                      <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem' }}>
                        <span style={{ color: '#00F0FF' }}>● 20 EMA: ₹{stockData.technicals?.ema20}</span>
                        <span style={{ color: '#FFC107' }}>● 50 EMA: ₹{stockData.technicals?.ema50}</span>
                      </div>
                    </div>

                    <div style={{ height: 280, width: '100%', background: 'rgba(5,8,14,0.6)', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                      {chartData.map((pt, idx) => {
                        if (idx % 2 !== 0) return null;
                        const min = Math.min(...chartData.map(c => c.low));
                        const max = Math.max(...chartData.map(c => c.high));
                        const heightPct = Math.max(10, ((pt.close - min) / (max - min || 1)) * 100);
                        const isUp = pt.close >= pt.open;
                        return (
                          <div 
                            key={pt.date} 
                            style={{ flex: 1, height: `${heightPct}%`, background: isUp ? 'var(--bull-green)' : 'var(--bear-red)', opacity: 0.85, borderRadius: 2 }}
                            title={`Date: ${pt.date} | Close: ₹${pt.close}`}
                          />
                        );
                      })}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 8 }}>
                      <div className="glass-panel" style={{ padding: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RSI (14)</div>
                        <div className="mono" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{stockData.technicals?.rsi}</div>
                      </div>
                      <div className="glass-panel" style={{ padding: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supertrend</div>
                        <div className="badge badge-bull" style={{ marginTop: 4 }}>{stockData.technicals?.supertrend_direction}</div>
                      </div>
                      <div className="glass-panel" style={{ padding: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vol Ratio</div>
                        <div className="mono" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{stockData.technicals?.volume_ratio}x</div>
                      </div>
                      <div className="glass-panel" style={{ padding: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ATR (14)</div>
                        <div className="mono" style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{stockData.technicals?.atr}</div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, borderLeft: '4px solid var(--accent-cyan)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          INSTITUTIONAL RESEARCH MEMO
                        </span>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>50-Year Veteran Consensus</h3>
                      </div>
                      <div style={{ fontSize: '1.2rem', color: 'var(--warning-gold)' }}>
                        {stockData.ai_veteran_memo?.conviction_stars}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', background: 'rgba(0, 240, 255, 0.05)', padding: 12, borderRadius: 8, border: '1px solid rgba(0,240,255,0.15)' }}>
                      {stockData.ai_veteran_memo?.verdict_summary}
                    </p>

                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>Investment Thesis & Catalysts</h4>
                      <ul style={{ paddingLeft: 18, fontSize: '0.88rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {stockData.ai_veteran_memo?.investment_thesis?.map((bullet, idx) => (
                          <li key={idx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ background: 'rgba(10, 15, 25, 0.9)', padding: 16, borderRadius: 10, border: '1px solid var(--panel-border)', marginTop: 4 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: 10 }}>
                        🎯 Actionable Trade Execution Blueprint
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: '0.85rem' }}>
                        <div><span style={{ color: 'var(--text-muted)' }}>Entry Zone: </span><span className="mono" style={{ fontWeight: 700 }}>{stockData.trade_plan?.entry_zone}</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Stop Loss: </span><span className="mono" style={{ color: 'var(--bear-red)', fontWeight: 700 }}>₹{stockData.trade_plan?.stop_loss} ({stockData.trade_plan?.stop_loss_pct})</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Target 1: </span><span className="mono" style={{ color: 'var(--bull-green)', fontWeight: 700 }}>₹{stockData.trade_plan?.target_1} ({stockData.trade_plan?.target_1_pct})</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Target 2: </span><span className="mono" style={{ color: 'var(--bull-green)', fontWeight: 700 }}>₹{stockData.trade_plan?.target_2} ({stockData.trade_plan?.target_2_pct})</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* TAB 3: MUTUAL FUNDS SCANNER */}
        {activeTab === 'mutual_funds' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Top Indian Mutual Funds Screener</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Institutional screening across Flexi Cap, Large Cap, Mid Cap, Small Cap, Index, and Debt funds.</p>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {mfData?.available_categories?.map((cat) => (
                  <button key={cat} onClick={() => { setMfCategory(cat); fetchMutualFunds(cat); }} className={mfCategory === cat ? 'btn-primary' : 'btn-secondary'} style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Fund Name & AMC</th>
                      <th>Category</th>
                      <th>NAV (₹)</th>
                      <th>1Y CAGR</th>
                      <th>3Y CAGR</th>
                      <th>5Y CAGR</th>
                      <th>Expense Ratio</th>
                      <th>AUM (₹ Cr)</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mfData?.funds?.map((fund) => (
                      <tr key={fund.id}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#FFF' }}>{fund.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fund.amc}</div>
                        </td>
                        <td><span className="badge badge-cyan">{fund.category}</span></td>
                        <td className="mono" style={{ fontWeight: 700 }}>₹{fund.nav}</td>
                        <td className="mono" style={{ color: 'var(--bull-green)', fontWeight: 600 }}>+{fund.cagr_1y}%</td>
                        <td className="mono" style={{ color: 'var(--bull-green)', fontWeight: 700, fontSize: '0.95rem' }}>+{fund.cagr_3y}%</td>
                        <td className="mono" style={{ color: 'var(--bull-green)', fontWeight: 600 }}>+{fund.cagr_5y}%</td>
                        <td className="mono" style={{ fontSize: '0.85rem' }}>{fund.expense_ratio}%</td>
                        <td className="mono" style={{ fontWeight: 600 }}>₹{fund.aum_cr?.toLocaleString()}</td>
                        <td><span style={{ color: 'var(--warning-gold)', letterSpacing: 2, fontWeight: 700 }}>{'★'.repeat(fund.stars)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GOLD, SILVER & BONDS */}
        {activeTab === 'commodities_bonds' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Gold, Silver & Fixed Income Yield Tracker</h2>
              <p style={{ color: 'var(--text-secondary)' }}>MCX Commodities, Sovereign Gold Bonds (SGB), RBI 10Y G-Sec yield, Corporate AAA Bonds, and Bank FDs.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div className="glass-panel" style={{ padding: 20, borderLeft: '4px solid var(--warning-gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MCX Gold (24K)</span>
                  <Coins size={20} color="var(--warning-gold)" />
                </div>
                <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8 }}>
                  ₹{commBondsData?.commodities?.gold_24k_10g?.price_rs?.toLocaleString()}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: '0.82rem' }}>
                  <span className="mono" style={{ color: 'var(--bull-green)' }}>+1Y CAGR: {commBondsData?.commodities?.gold_24k_10g?.return_1y_pct}%</span>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: 20, borderLeft: '4px solid #E0E0E0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MCX Fine Silver</span>
                  <Coins size={20} color="#E0E0E0" />
                </div>
                <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8 }}>
                  ₹{commBondsData?.commodities?.silver_1kg?.price_rs?.toLocaleString()}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: '0.82rem' }}>
                  <span className="mono" style={{ color: 'var(--bull-green)' }}>+1Y CAGR: {commBondsData?.commodities?.silver_1kg?.return_1y_pct}%</span>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: 20, borderLeft: '4px solid var(--accent-cyan)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>RBI 10Y G-Sec Yield</span>
                  <Landmark size={20} color="var(--accent-cyan)" />
                </div>
                <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: 'var(--accent-cyan)' }}>
                  {commBondsData?.fixed_income?.g_sec_10y_yield_pct}%
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 }}>Sovereign Gold Bonds (SGB) Secondary Market Matrix</h3>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>SGB Tranche Series</th>
                      <th>Issue Price</th>
                      <th>Current Price</th>
                      <th>Coupon Rate</th>
                      <th>Maturity Date</th>
                      <th>Tax Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commBondsData?.commodities?.sgb_tranches?.map((sgb, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700, color: '#FFF' }}>{sgb.series}</td>
                        <td className="mono">₹{sgb.issue_price_rs}</td>
                        <td className="mono" style={{ fontWeight: 700 }}>₹{sgb.current_market_price_rs}</td>
                        <td className="mono" style={{ color: 'var(--warning-gold)', fontWeight: 700 }}>{sgb.coupon_rate_pct}% p.a.</td>
                        <td className="mono">{sgb.maturity_date}</td>
                        <td><span className="badge badge-bull">{sgb.tax_status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SIP & WEALTH ALLOCATOR */}
        {activeTab === 'wealth_planner' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>SIP Growth & Asset Allocation Wealth Planner</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Plan long-term wealth compounding with monthly SIP step-ups and risk-profile asset allocation.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24 }}>
              <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>🧮 Monthly SIP Compounder</h3>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Monthly SIP Amount (₹)</label>
                  <input type="number" className="search-input mono" value={sipMonthly} onChange={(e) => { setSipMonthly(e.target.value); fetchSipCalculation(e.target.value, sipTenure, sipReturn, sipStepup); }} />
                </div>
                {sipResult && (
                  <div className="glass-panel" style={{ padding: 18, background: 'rgba(0, 240, 255, 0.03)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Final Projected Corpus</div>
                    <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>₹{sipResult.final_corpus_rs?.toLocaleString()}</div>
                  </div>
                )}
              </div>

              <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>📊 Risk-Adjusted Asset Allocation Advisor</h3>
                {allocResult && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {allocResult.recommended_instruments?.map((item, i) => (
                      <div key={i} className="glass-panel" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#FFF' }}>{item.asset_class}</span>
                        <span className="mono" style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>{item.allocation_pct}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MARKET PULSE */}
        {activeTab === 'pulse' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Indian Stock Market Pulse & Macro Regime</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Institutional flow analytics, sector rotation, and major index health checks.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {pulseData?.indices?.map((idx) => (
                <div key={idx.symbol} className="glass-panel" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{idx.name}</h3>
                  <div className="mono" style={{ fontSize: '2rem', fontWeight: 800, marginTop: 12 }}>₹{idx.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: STRATEGY BACKTESTER */}
        {activeTab === 'backtester' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Quantitative Strategy Backtester</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Test algorithmic trading rules against historical NSE stock price data.</p>
            </div>
            <form onSubmit={handleRunBacktest} className="glass-panel" style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'flex-end' }}>
              <input type="text" className="search-input" value={btTicker} onChange={(e) => setBtTicker(e.target.value)} />
              <button type="submit" className="btn-primary">Execute Backtest</button>
            </form>
          </div>
        )}

        {/* TAB 8: POSITION CALCULATOR */}
        {activeTab === 'calculator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Position Sizing & Risk Management Cockpit</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Calculate exact share quantity based on total capital & fixed risk tolerance % per trade.</p>
            </div>
            <form onSubmit={handleCalculatePosition} className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="number" className="search-input mono" value={calcCapital} onChange={(e) => setCalcCapital(e.target.value)} />
              <button type="submit" className="btn-primary">Calculate Position Size</button>
            </form>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{ background: 'rgba(5, 8, 14, 0.95)', borderTop: '1px solid var(--panel-border)', padding: '20px 28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        BharatAlpha Invest 📈 — Autonomous Multi-Agent Investment Intelligence Engine | Powered by 50+ Years Veteran Wisdom
      </footer>
    </div>
  );
}
