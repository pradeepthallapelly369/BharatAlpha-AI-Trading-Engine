import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, ShieldAlert, Zap, Search, 
  BarChart2, Filter, Award, Target, Calculator, PieChart, Activity, RefreshCw,
  Coins, Landmark, Percent, Layers
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('screener');
  const [searchTicker, setSearchTicker] = useState('RELIANCE');
  const [stockData, setStockData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [screenerData, setScreenerData] = useState(null);
  const [pulseData, setPulseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [screenerFilter, setScreenerFilter] = useState('long_term');
  
  // Mutual Funds state
  const [mfCategory, setMfCategory] = useState('ALL');
  const [mfData, setMfData] = useState(null);
  const [mfLoading, setMfLoading] = useState(false);

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
    fetchScreener();
    fetchStockDetails('RELIANCE');
    fetchMutualFunds('ALL');
    fetchCommoditiesBonds();
    fetchSipCalculation(25000, 15, 15.0, 10.0);
    fetchPortfolioAllocation(32, 'MODERATE');
  }, []);

  const fetchMarketPulse = async () => {
    try {
      const res = await fetch('/api/market-pulse');
      const data = await res.json();
      setPulseData(data);
    } catch (e) {
      console.error('Pulse fetch error:', e);
    }
  };

  const fetchScreener = async () => {
    try {
      const res = await fetch('/api/screener');
      const data = await res.json();
      setScreenerData(data.data);
    } catch (e) {
      console.error('Screener fetch error:', e);
    }
  };

  const fetchStockDetails = async (tickerSymbol) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stock/${tickerSymbol}`);
      const data = await res.json();
      if (data.status === 'success') {
        setStockData(data);
        fetchStockChart(tickerSymbol);
      }
    } catch (e) {
      console.error('Stock detail error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockChart = async (tickerSymbol) => {
    try {
      const res = await fetch(`/api/stock/${tickerSymbol}/chart?period=6m`);
      const data = await res.json();
      if (data.status === 'success') {
        setChartData(data.chart || []);
      }
    } catch (e) {
      console.error('Chart fetch error:', e);
    }
  };

  const fetchMutualFunds = async (cat) => {
    setMfLoading(true);
    try {
      const res = await fetch(`/api/invest/mutual-funds?category=${cat}`);
      const data = await res.json();
      setMfData(data);
    } catch (e) {
      console.error('MF fetch error:', e);
    } finally {
      setMfLoading(false);
    }
  };

  const fetchCommoditiesBonds = async () => {
    try {
      const res = await fetch('/api/invest/commodities-bonds');
      const data = await res.json();
      setCommBondsData(data);
    } catch (e) {
      console.error('CommBonds fetch error:', e);
    }
  };

  const fetchSipCalculation = async (m, t, r, s) => {
    try {
      const res = await fetch('/api/invest/sip-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthly_sip: parseFloat(m),
          tenure_years: parseInt(t),
          expected_cagr_pct: parseFloat(r),
          stepup_pct: parseFloat(s)
        })
      });
      const data = await res.json();
      setSipResult(data);
    } catch (e) {
      console.error('SIP calc error:', e);
    }
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
    } catch (e) {
      console.error('Alloc fetch error:', e);
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
      if (data.status === 'success') {
        setBtResult(data.data);
      }
    } catch (e) {
      console.error('Backtest error:', e);
    } finally {
      setBtLoading(false);
    }
  };

  const handleCalculatePosition = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/position-size', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capital: parseFloat(calcCapital),
          risk_tolerance_pct: parseFloat(calcRiskPct),
          entry_price: parseFloat(calcEntry),
          stop_loss_price: parseFloat(calcStopLoss)
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCalcResult(data);
      }
    } catch (e) {
      console.error('Calc error:', e);
    }
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
                50-Year Veteran Long-Term Wealth Intelligence
              </p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: '1 1 300px', maxWidth: 450 }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input 
                type="text"
                className="search-input"
                placeholder="Search NSE stock (e.g. RELIANCE, TATAMOTORS, DIXON)..."
                value={searchTicker}
                onChange={(e) => setSearchTicker(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
            </div>
            <button type="submit" className="btn-primary">Analyze</button>
          </form>

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

              {/* Screener Filter Toggle */}
              <div className="glass-panel" style={{ padding: 4, display: 'flex', gap: 4 }}>
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

            {/* Screener Table */}
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
                {/* Stock Overview Header */}
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

                {/* 2-Column Grid: Chart & Veteran Memo */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24 }}>
                  
                  {/* Price & Indicator Canvas Chart */}
                  <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>6-Month Technical Trend & Moving Averages</h3>
                      <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem' }}>
                        <span style={{ color: '#00F0FF' }}>● 20 EMA: ₹{stockData.technicals?.ema20}</span>
                        <span style={{ color: '#FFC107' }}>● 50 EMA: ₹{stockData.technicals?.ema50}</span>
                      </div>
                    </div>

                    {/* Chart Container */}
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

                    {/* Technical Indicator Indicators */}
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

                  {/* 50-Year Veteran AI Investment Memo */}
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

                    {/* Trade Blueprint Card */}
                    <div style={{ background: 'rgba(10, 15, 25, 0.9)', padding: 16, borderRadius: 10, border: '1px solid var(--panel-border)', marginTop: 4 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: 10 }}>
                        🎯 Actionable Trade Execution Blueprint
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: '0.85rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Entry Zone: </span>
                          <span className="mono" style={{ fontWeight: 700 }}>{stockData.trade_plan?.entry_zone}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Stop Loss: </span>
                          <span className="mono" style={{ color: 'var(--bear-red)', fontWeight: 700 }}>₹{stockData.trade_plan?.stop_loss} ({stockData.trade_plan?.stop_loss_pct})</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Target 1: </span>
                          <span className="mono" style={{ color: 'var(--bull-green)', fontWeight: 700 }}>₹{stockData.trade_plan?.target_1} ({stockData.trade_plan?.target_1_pct})</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Target 2: </span>
                          <span className="mono" style={{ color: 'var(--bull-green)', fontWeight: 700 }}>₹{stockData.trade_plan?.target_2} ({stockData.trade_plan?.target_2_pct})</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Risk : Reward: </span>
                          <span className="mono" style={{ fontWeight: 700 }}>{stockData.trade_plan?.risk_reward_ratio}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Time Horizon: </span>
                          <span style={{ fontWeight: 600, color: 'var(--warning-gold)' }}>{stockData.trade_plan?.horizon}</span>
                        </div>
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

              {/* Category Filters */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {mfData?.available_categories?.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setMfCategory(cat);
                      fetchMutualFunds(cat);
                    }}
                    className={mfCategory === cat ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Mutual Funds Table */}
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
                      <th>Investment Thesis</th>
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
                        <td>
                          <span style={{ color: 'var(--warning-gold)', letterSpacing: 2, fontWeight: 700 }}>
                            {'★'.repeat(fund.stars)}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 280 }}>
                          {fund.thesis}
                        </td>
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

            {/* Top Stat Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              
              {/* Gold Card */}
              <div className="glass-panel" style={{ padding: 20, borderLeft: '4px solid var(--warning-gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MCX Gold (24K 999 Purity)</span>
                  <Coins size={20} color="var(--warning-gold)" />
                </div>
                <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8 }}>
                  ₹{commBondsData?.commodities?.gold_24k_10g?.price_rs?.toLocaleString()}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: '0.82rem' }}>
                  <span className="mono" style={{ color: 'var(--bull-green)' }}>+1Y CAGR: {commBondsData?.commodities?.gold_24k_10g?.return_1y_pct}%</span>
                  <span style={{ color: 'var(--text-muted)' }}>per 10g</span>
                </div>
              </div>

              {/* Silver Card */}
              <div className="glass-panel" style={{ padding: 20, borderLeft: '4px solid #E0E0E0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MCX Fine Silver (999 Purity)</span>
                  <Coins size={20} color="#E0E0E0" />
                </div>
                <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8 }}>
                  ₹{commBondsData?.commodities?.silver_1kg?.price_rs?.toLocaleString()}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: '0.82rem' }}>
                  <span className="mono" style={{ color: 'var(--bull-green)' }}>+1Y CAGR: {commBondsData?.commodities?.silver_1kg?.return_1y_pct}%</span>
                  <span style={{ color: 'var(--text-muted)' }}>per 1kg</span>
                </div>
              </div>

              {/* RBI 10Y G-Sec Yield Card */}
              <div className="glass-panel" style={{ padding: 20, borderLeft: '4px solid var(--accent-cyan)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>RBI 10Y G-Sec Benchmark Yield</span>
                  <Landmark size={20} color="var(--accent-cyan)" />
                </div>
                <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: 'var(--accent-cyan)' }}>
                  {commBondsData?.fixed_income?.g_sec_10y_yield_pct}%
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Real Yield (above CPI): +{commBondsData?.fixed_income?.real_yield_pct}%</span>
                </div>
              </div>

            </div>

            {/* Sovereign Gold Bonds (SGB) Table */}
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
                      <th>Projected CAGR</th>
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
                        <td className="mono" style={{ color: 'var(--bull-green)', fontWeight: 700 }}>+{sgb.cagr_projected_pct}%</td>
                        <td><span className="badge badge-bull">{sgb.tax_status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2-Column Grid: Corporate Bonds & Bank FDs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24 }}>
              
              {/* Corporate AAA Bonds */}
              <div className="glass-panel" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 14 }}>Corporate AAA NCD Bonds</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {commBondsData?.fixed_income?.corporate_bonds?.map((b, i) => (
                    <div key={i} className="glass-panel" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#FFF' }}>{b.issuer}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tenure: {b.tenure} | Rating: {b.rating}</div>
                      </div>
                      <div className="mono" style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--bull-green)' }}>{b.yield_to_maturity_pct}% YTM</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Coupon: {b.coupon_pct}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank FD Comparison */}
              <div className="glass-panel" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 14 }}>Bank Fixed Deposit Rates Comparison</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {commBondsData?.fixed_income?.bank_fds?.map((fd, i) => (
                    <div key={i} className="glass-panel" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#FFF' }}>{fd.bank}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Best Tenure: {fd.best_tenure}</div>
                      </div>
                      <div className="mono" style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{fd.regular_rate_pct}% p.a.</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--warning-gold)' }}>Senior Citizens: {fd.senior_rate_pct}%</div>
                      </div>
                    </div>
                  ))}
                </div>
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
              
              {/* SIP Calculator Controls */}
              <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>🧮 Monthly SIP Compounder</h3>
                
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Monthly SIP Amount (₹)</label>
                  <input 
                    type="number" 
                    className="search-input mono" 
                    value={sipMonthly}
                    onChange={(e) => {
                      setSipMonthly(e.target.value);
                      fetchSipCalculation(e.target.value, sipTenure, sipReturn, sipStepup);
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Investment Horizon (Years): {sipTenure} Yrs</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="30" 
                    value={sipTenure}
                    onChange={(e) => {
                      setSipTenure(e.target.value);
                      fetchSipCalculation(sipMonthly, e.target.value, sipReturn, sipStepup);
                    }}
                    style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Expected Return (CAGR %): {sipReturn}%</label>
                  <input 
                    type="range" 
                    min="6" 
                    max="25" 
                    step="0.5"
                    value={sipReturn}
                    onChange={(e) => {
                      setSipReturn(e.target.value);
                      fetchSipCalculation(sipMonthly, sipTenure, e.target.value, sipStepup);
                    }}
                    style={{ width: '100%', accentColor: 'var(--bull-green)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Annual Step-Up (%): {sipStepup}%</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="25" 
                    step="1"
                    value={sipStepup}
                    onChange={(e) => {
                      setSipStepup(e.target.value);
                      fetchSipCalculation(sipMonthly, sipTenure, sipReturn, e.target.value);
                    }}
                    style={{ width: '100%', accentColor: 'var(--warning-gold)' }}
                  />
                </div>

                {/* SIP Results Card */}
                {sipResult && (
                  <div className="glass-panel" style={{ padding: 18, background: 'rgba(0, 240, 255, 0.03)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Invested</div>
                        <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 700 }}>₹{sipResult.total_invested_rs?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wealth Gain</div>
                        <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--bull-green)' }}>+₹{sipResult.wealth_gained_rs?.toLocaleString()}</div>
                      </div>
                      <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--panel-border)', paddingTop: 10 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Final Projected Corpus</div>
                        <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          ₹{sipResult.final_corpus_rs?.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--warning-gold)', marginTop: 2 }}>
                          Wealth Multiplier: {sipResult.wealth_multiplier}x capital returned
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Portfolio Asset Allocator */}
              <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>📊 Risk-Adjusted Asset Allocation Advisor</h3>
                
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Your Current Age: {allocAge} Years</label>
                  <input 
                    type="range" 
                    min="18" 
                    max="75" 
                    value={allocAge}
                    onChange={(e) => {
                      setAllocAge(e.target.value);
                      fetchPortfolioAllocation(e.target.value, allocRisk);
                    }}
                    style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Risk Tolerance Profile</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE', 'VERY_AGGRESSIVE'].map((risk) => (
                      <button
                        key={risk}
                        type="button"
                        onClick={() => {
                          setAllocRisk(risk);
                          fetchPortfolioAllocation(allocAge, risk);
                        }}
                        className={allocRisk === risk ? 'btn-primary' : 'btn-secondary'}
                        style={{ padding: '8px 10px', fontSize: '0.8rem' }}
                      >
                        {risk.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allocation Results Breakdown */}
                {allocResult && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Recommended Target Portfolio Mix:
                    </div>
                    {allocResult.recommended_instruments?.map((item, i) => (
                      <div key={i} className="glass-panel" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFF' }}>{item.asset_class}</span>
                          <span className="mono" style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '1rem' }}>
                            {item.allocation_pct}%
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.sub_split}</div>
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

            <div className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid var(--bull-green)' }}>
              <div>
                <span className="badge badge-bull">CURRENT REGIME: CONFIRMED UPTREND</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 8 }}>
                  FII & DII Net Institutional Activity: Strong Domestic Mutual Fund Inflows
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                  {pulseData?.fii_dii_summary}
                </p>
              </div>
              <ShieldAlert size={36} color="var(--bull-green)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {pulseData?.indices?.map((idx) => (
                <div key={idx.symbol} className="glass-panel" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{idx.name}</h3>
                    <span className={`badge ${idx.trend === 'BULLISH' ? 'badge-bull' : 'badge-bear'}`}>{idx.trend}</span>
                  </div>
                  <div className="mono" style={{ fontSize: '2rem', fontWeight: 800, marginTop: 12 }}>₹{idx.price}</div>
                  <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: idx.change_pct >= 0 ? 'var(--bull-green)' : 'var(--bear-red)' }}>
                    {idx.change >= 0 ? `+${idx.change} (+${idx.change_pct}%)` : `${idx.change} (${idx.change_pct}%)`}
                  </div>
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

            {/* Form */}
            <form onSubmit={handleRunBacktest} className="glass-panel" style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Stock Symbol</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ width: 160 }} 
                  value={btTicker} 
                  onChange={(e) => setBtTicker(e.target.value)} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Algorithmic Strategy</label>
                <select 
                  className="search-input" 
                  style={{ width: 220 }}
                  value={btStrategy}
                  onChange={(e) => setBtStrategy(e.target.value)}
                >
                  <option value="EMA_CROSSOVER">20/50 EMA Golden Cross</option>
                  <option value="SUPERTREND_BREAKOUT">Supertrend Trend Breakout</option>
                  <option value="RSI_OVERSOLD_REBOUND">RSI Oversold Rebound (&lt;35)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Backtest Period</label>
                <select 
                  className="search-input" 
                  style={{ width: 120 }}
                  value={btPeriod}
                  onChange={(e) => setBtPeriod(e.target.value)}
                >
                  <option value="1y">1 Year</option>
                  <option value="2y">2 Years</option>
                  <option value="3y">3 Years</option>
                  <option value="5y">5 Years</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" disabled={btLoading}>
                {btLoading ? 'Running Simulation...' : 'Execute Backtest'}
              </button>
            </form>

            {/* Backtest Results */}
            {btResult && (
              <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Backtest Results: {btResult.ticker} ({btResult.strategy})</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                  <div className="glass-panel" style={{ padding: 16 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Strategy Return</div>
                    <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: btResult.total_return_pct >= 0 ? 'var(--bull-green)' : 'var(--bear-red)' }}>
                      {btResult.total_return_pct}%
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: 16 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Benchmark Buy & Hold</div>
                    <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{btResult.benchmark_return_pct}%</div>
                  </div>
                  <div className="glass-panel" style={{ padding: 16 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Win Rate</div>
                    <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{btResult.win_rate_pct}%</div>
                  </div>
                  <div className="glass-panel" style={{ padding: 16 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Trades</div>
                    <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{btResult.total_trades}</div>
                  </div>
                  <div className="glass-panel" style={{ padding: 16 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Drawdown</div>
                    <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--bear-red)' }}>-{btResult.max_drawdown_pct}%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: POSITION & RISK CALCULATOR */}
        {activeTab === 'calculator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Position Sizing & Risk Management Cockpit</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Calculate exact share quantity based on total capital & fixed risk tolerance % per trade.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
              {/* Calculator Form */}
              <form onSubmit={handleCalculatePosition} className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Total Portfolio Capital (₹)</label>
                  <input 
                    type="number" 
                    className="search-input mono" 
                    value={calcCapital} 
                    onChange={(e) => setCalcCapital(e.target.value)} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Max Risk Tolerance per Trade (%)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="search-input mono" 
                    value={calcRiskPct} 
                    onChange={(e) => setCalcRiskPct(e.target.value)} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Proposed Entry Price (₹)</label>
                  <input 
                    type="number" 
                    className="search-input mono" 
                    value={calcEntry} 
                    onChange={(e) => setCalcEntry(e.target.value)} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Stop Loss Price (₹)</label>
                  <input 
                    type="number" 
                    className="search-input mono" 
                    value={calcStopLoss} 
                    onChange={(e) => setCalcStopLoss(e.target.value)} 
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>Calculate Position Size</button>
              </form>

              {/* Calculator Results Card */}
              {calcResult ? (
                <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, borderLeft: '4px solid var(--accent-cyan)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Risk Management Output</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    <div className="glass-panel" style={{ padding: 16 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recommended Shares</div>
                      <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        {calcResult.recommended_shares}
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: 16 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Risk Allowed</div>
                      <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--bear-red)' }}>
                        ₹{calcResult.max_risk_allowed_rs}
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: 16 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Position Value</div>
                      <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                        ₹{calcResult.total_position_value_rs}
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: 16 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Portfolio Allocation</div>
                      <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--warning-gold)' }}>
                        {calcResult.portfolio_allocation_pct}%
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  Enter position parameters and click Calculate to view risk sizing.
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{ background: 'rgba(5, 8, 14, 0.95)', borderTop: '1px solid var(--panel-border)', padding: '20px 28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        BharatAlpha Invest 📈 — Institutional Stock Market Investment & Quantitative Trading Engine | Powered by 50+ Years Veteran Wisdom
      </footer>
    </div>
  );
}
