import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Target, Shield, Zap, Search, 
  RefreshCw, CheckCircle2, AlertTriangle, ChevronRight, X, ArrowUpRight, ArrowDownRight, Layers
} from 'lucide-react';

export default function OrderBlockScreener({ onTradeExecuted, brokerStatus }) {
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [onlyPicks, setOnlyPicks] = useState(false);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState(null);
  const [stockDetail, setStockDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [execMessage, setExecMessage] = useState('');
  const [tradeMode, setTradeMode] = useState('paper');
  const [orderType, setOrderType] = useState('OPTIONS'); // OPTIONS or FUTURES

  useEffect(() => {
    fetchScan(false);
    const interval = setInterval(() => {
      fetchScan(false);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const fetchScan = async (refresh = false) => {
    try {
      if (refresh) setLoading(true);
      const res = await fetch(`/api/orderblock/scan?refresh=${refresh}`);
      const data = await res.json();
      if (data.status === 'success') {
        setScanData(data);
      }
    } catch (err) {
      console.error('Error fetching OrderBlock scan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStock = async (symbol) => {
    setSelectedStockSymbol(symbol);
    setDetailLoading(true);
    setExecMessage('');
    try {
      const res = await fetch(`/api/orderblock/stock/${symbol}`);
      const data = await res.json();
      setStockDetail(data);
    } catch (err) {
      console.error('Error fetching stock detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExecuteOrder = async () => {
    if (!stockDetail) return;
    setExecuting(true);
    setExecMessage('');
    try {
      const plan = stockDetail.trade_plan;
      const res = await fetch('/api/orderblock/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: stockDetail.stock.symbol,
          action: plan.action,
          order_type: orderType,
          mode: tradeMode,
          broker: 'fyers',
          target: plan.target_1,
          stop_loss: plan.stop_loss,
          qty: plan.lot_size,
          entry_price: stockDetail.stock.price,
        }),
      });
      const d = await res.json();
      setExecMessage(d.message || 'Trade executed successfully!');
      if (onTradeExecuted) onTradeExecuted();
    } catch (err) {
      setExecMessage('Execution failed: ' + err.message);
    } finally {
      setExecuting(false);
    }
  };

  const breadth = scanData?.breadth || {
    total_stocks: 213,
    bullish_count: 7,
    bearish_count: 206,
    market_bias: 'HEAVY BEARISH',
    bias_description: '206 Bearish vs 7 Bullish — Institutional Short Strategy Active',
  };

  const sectors = scanData?.sectors || [];
  const allStocks = scanData?.all_stocks || [];
  const topBullish = scanData?.top_bullish || [];
  const topBearish = scanData?.top_bearish || [];

  // When searching, picking a specific sector, or toggling Top-3 rule picks:
  // Query against ALL 213 stocks in the universe so ANY stock (e.g. SBIN) is found immediately!
  const isFiltering = searchQuery.trim() !== '' || selectedSector !== 'ALL' || onlyPicks;

  const allBullish = allStocks.length > 0 ? allStocks.filter((s) => s.is_bullish) : topBullish;
  const allBearish = allStocks.length > 0 ? allStocks.filter((s) => !s.is_bullish) : topBearish;

  const candidatePoolBullish = isFiltering ? allBullish : topBullish;
  const candidatePoolBearish = isFiltering ? allBearish : topBearish;

  // Filter candidates based on search, sector, and Top-3 rule filter
  const filterList = (list) => {
    const q = searchQuery.trim().toLowerCase();
    return list.filter((s) => {
      const matchSearch =
        q === '' ||
        (s.symbol && s.symbol.toLowerCase().includes(q)) ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.sector && s.sector.toLowerCase().includes(q));
      const matchSector = selectedSector === 'ALL' || s.sector === selectedSector;
      const matchPick = !onlyPicks || s.is_picked;
      return matchSearch && matchSector && matchPick;
    });
  };

  const filteredBullish = filterList(candidatePoolBullish);
  const filteredBearish = filterList(candidatePoolBearish);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* ─── Breadth & Strategy Header ───────────────────────── */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255, 152, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-orange)' }}>
              <Target size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Intraday Order Block & Market Breadth Engine</h2>
                <span className="mono" style={{ fontSize: '0.72rem', background: 'rgba(255, 152, 0, 0.2)', color: 'var(--accent-orange)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                  213 F&O STOCKS LIVE
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Institutional Supply/Demand Zones • Derivatives Buildup • Rule-Gated Top-3 Execution
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button 
              className="btn-secondary" 
              onClick={() => fetchScan(true)}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '0.8rem' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Scanning...' : 'Rescan Market'}</span>
            </button>

            <div className="glass-panel" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bull-green)' }}></span>
              <span className="mono" style={{ color: 'var(--text-secondary)' }}>9:15 - 15:30 IST</span>
            </div>
          </div>
        </div>

        {/* ─── Market Breadth Visualizer ──────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '14px 18px', borderRadius: 8, border: '1px solid var(--panel-border)' }}>
          {/* Bullish Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bull-bg)', border: '1px solid var(--bull-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bull-green)' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--bull-green)' }}>{breadth.bullish_count}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--bull-green)', textTransform: 'uppercase' }}>BULLISH</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Long Buildup & Strong Momentum</span>
            </div>
          </div>

          {/* Center Divergence Meter */}
          <div style={{ minWidth: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: '100%', height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${(breadth.bullish_count / breadth.total_stocks) * 100}%`, background: 'var(--bull-green)', transition: 'width 0.4s ease' }}></div>
              <div style={{ width: `${(breadth.bearish_count / breadth.total_stocks) * 100}%`, background: 'var(--bear-red)', transition: 'width 0.4s ease' }}></div>
            </div>
            <span className="mono" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-orange)' }}>
              {breadth.bias_description}
            </span>
          </div>

          {/* Bearish Side */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 8 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--bear-red)', textTransform: 'uppercase' }}>BEARISH</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--bear-red)' }}>{breadth.bearish_count}</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Short Buildup & Breakdown Pressures</span>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bear-bg)', border: '1px solid var(--bear-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bear-red)' }}>
              <TrendingDown size={20} />
            </div>
          </div>
        </div>

        {/* ─── Search & Quick Filters ─────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search 213 stocks or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{ width: '100%', paddingLeft: 36 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button 
              onClick={() => setOnlyPicks(!onlyPicks)}
              style={{
                padding: '7px 14px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                background: onlyPicks ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255,255,255,0.05)',
                color: onlyPicks ? 'var(--accent-orange)' : 'var(--text-secondary)',
                border: onlyPicks ? '1px solid var(--accent-orange)' : '1px solid var(--panel-border)',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <Zap size={13} />
              <span>Top-3 Rule Picks Only</span>
            </button>

            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="search-input"
              style={{ width: 160, fontSize: '0.78rem', padding: '7px 10px' }}
            >
              <option value="ALL">All Sectors ({sectors.length})</option>
              {sectors.map((s) => (
                <option key={s.sector} value={s.sector}>
                  {s.sector} ({s.avg_change_pct >= 0 ? '+' : ''}{s.avg_change_pct}%)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── Sector Heatmap Scrollbar ─────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
        <button
          onClick={() => setSelectedSector('ALL')}
          style={{
            padding: '6px 12px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            background: selectedSector === 'ALL' ? 'var(--accent-orange)' : 'rgba(255,255,255,0.04)',
            color: selectedSector === 'ALL' ? '#000' : 'var(--text-secondary)',
            border: 'none',
          }}
        >
          ALL SECTORS
        </button>
        {sectors.slice(0, 16).map((sec) => (
          <button
            key={sec.sector}
            onClick={() => setSelectedSector(sec.sector === selectedSector ? 'ALL' : sec.sector)}
            style={{
              padding: '6px 12px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              background: selectedSector === sec.sector ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.03)',
              color: sec.avg_change_pct >= 0 ? 'var(--bull-green)' : 'var(--bear-red)',
              border: selectedSector === sec.sector ? '1px solid rgba(255,255,255,0.3)' : '1px solid var(--panel-border)',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <span>{sec.sector}</span>
            <span className="mono">{sec.avg_change_pct >= 0 ? '+' : ''}{sec.avg_change_pct}%</span>
          </button>
        ))}
      </div>

      {/* ─── Two-Column Candidate Cards (Bullish vs Bearish) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
        
        {/* ─── Left Column: Bullish Order Block Setups ──────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '2px solid rgba(0, 230, 118, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--bull-green)' }}></span>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--bull-green)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Bullish Candidates ({filteredBullish.length})
              </h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Long Buildup & Retest Demands</span>
          </div>

          {filteredBullish.length === 0 ? (
            <div className="glass-panel" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
              No bullish setups matched the current filters.
            </div>
          ) : (
            filteredBullish.map((stock) => (
              <StockCandidateCard 
                key={stock.symbol} 
                stock={stock} 
                isBull={true}
                onClick={() => handleSelectStock(stock.symbol)} 
              />
            ))
          )}
        </div>

        {/* ─── Right Column: Bearish Order Block Setups ─────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '2px solid rgba(255, 23, 68, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--bear-red)' }}></span>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--bear-red)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Bearish Candidates ({filteredBearish.length})
              </h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Short Buildup & Supply Retests</span>
          </div>

          {filteredBearish.length === 0 ? (
            <div className="glass-panel" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
              No bearish setups matched the current filters.
            </div>
          ) : (
            filteredBearish.map((stock) => (
              <StockCandidateCard 
                key={stock.symbol} 
                stock={stock} 
                isBull={false}
                onClick={() => handleSelectStock(stock.symbol)} 
              />
            ))
          )}
        </div>

      </div>

      {/* ─── Stock Technical Details & Execution Modal ──────── */}
      {selectedStockSymbol && (
        <StockDetailModal 
          symbol={selectedStockSymbol}
          detail={stockDetail}
          loading={detailLoading}
          tradeMode={tradeMode}
          setTradeMode={setTradeMode}
          orderType={orderType}
          setOrderType={setOrderType}
          executing={executing}
          execMessage={execMessage}
          onExecute={handleExecuteOrder}
          onClose={() => { setSelectedStockSymbol(null); setStockDetail(null); }}
        />
      )}

    </div>
  );
}

// ─── Individual Stock Candidate Card Component ───────────────
function StockCandidateCard({ stock, isBull, onClick }) {
  const isPicked = stock.is_picked;
  const isExcluded = stock.event_excluded;

  return (
    <div 
      className="glass-panel" 
      onClick={onClick}
      style={{
        padding: '16px 18px',
        cursor: 'pointer',
        borderLeft: `4px solid ${isBull ? 'var(--bull-green)' : 'var(--bear-red)'}`,
        background: isPicked 
          ? (isBull ? 'rgba(0, 230, 118, 0.05)' : 'rgba(255, 23, 68, 0.05)') 
          : 'var(--panel-bg)',
        boxShadow: isPicked ? `0 0 16px ${isBull ? 'rgba(0,230,118,0.1)' : 'rgba(255,23,68,0.1)'}` : 'none',
        display: 'flex', flexDirection: 'column', gap: 12,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="mono" style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
            {stock.rank_index < 10 ? `0${stock.rank_index}` : stock.rank_index}
          </span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{stock.symbol}</h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>• {stock.sector}</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{stock.name}</p>
          </div>
        </div>

        {/* Score & Conviction */}
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '3px 8px', borderRadius: 6,
            background: isBull ? 'var(--bull-bg)' : 'var(--bear-bg)',
            color: isBull ? 'var(--bull-green)' : 'var(--bear-red)',
            fontWeight: 800, fontSize: '0.75rem'
          }}>
            <span>{isBull ? 'BULLISH' : 'BEARISH'}</span>
            <span className="mono">{stock.conviction_score}</span>
          </div>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            ●●●●○
          </span>
        </div>
      </div>

      {/* Price & Buildup Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: 6 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: isBull ? 'var(--bull-green)' : 'var(--bear-red)' }}>
              {isBull ? '+' : ''}{stock.change_pct}%
            </span>
            <span className="mono" style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
              ₹{stock.price?.toLocaleString()}
            </span>
          </div>
          <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            {stock.change_val >= 0 ? '+' : ''}{stock.change_val}
          </span>
        </div>

        {/* Buildup Tag */}
        <div style={{ textAlign: 'right' }}>
          <span className="mono" style={{
            fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4,
            background: stock.buildup === 'LONG BUILD-UP' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 23, 68, 0.15)',
            color: stock.buildup === 'LONG BUILD-UP' ? 'var(--bull-green)' : 'var(--bear-red)'
          }}>
            {stock.buildup}
          </span>
          <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            OI {stock.oi_change_pct >= 0 ? '+' : ''}{stock.oi_change_pct}% • Δ {stock.delta_volume_str}
          </div>
        </div>
      </div>

      {/* Order Block Technical Matrix & Levels */}
      <div className="mono" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '4px 6px', borderRadius: 4 }}>
          <span style={{ color: 'var(--text-muted)', display: 'block' }}>VWAP</span>
          <span style={{ fontWeight: 600 }}>₹{stock.vwap}</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '4px 6px', borderRadius: 4 }}>
          <span style={{ color: 'var(--text-muted)', display: 'block' }}>OB ZONE</span>
          <span style={{ fontWeight: 600, color: 'var(--accent-orange)' }}>{stock.ob_zone_str}</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '4px 6px', borderRadius: 4 }}>
          <span style={{ color: 'var(--text-muted)', display: 'block' }}>TARGET</span>
          <span style={{ fontWeight: 600 }}>₹{isBull ? stock.resistance_1 : stock.support_1}</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '4px 6px', borderRadius: 4 }}>
          <span style={{ color: 'var(--text-muted)', display: 'block' }}>R:R RATIO</span>
          <span style={{ fontWeight: 700, color: 'var(--bull-green)' }}>{stock.rr_ratio}</span>
        </div>
      </div>

      {/* Rule Recommendation Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
        <span style={{
          fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4,
          background: isExcluded 
            ? 'rgba(255, 193, 7, 0.2)' 
            : (isPicked ? (isBull ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 23, 68, 0.2)') : 'rgba(255,255,255,0.05)'),
          color: isExcluded 
            ? 'var(--warning-gold)' 
            : (isPicked ? (isBull ? 'var(--bull-green)' : 'var(--bear-red)') : 'var(--text-muted)'),
          border: isPicked ? `1px solid ${isBull ? 'var(--bull-green)' : 'var(--bear-red)'}` : 'none'
        }}>
          {stock.rule_status}
        </span>

        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 2 }}>
          <span>Inspect Plan</span>
          <ChevronRight size={14} />
        </span>
      </div>
    </div>
  );
}

// ─── Interactive Candlestick & Technical Modal Component ─────
function StockDetailModal({ 
  symbol, detail, loading, tradeMode, setTradeMode, 
  orderType, setOrderType, executing, execMessage, onExecute, onClose 
}) {
  const stock = detail?.stock;
  const candles = detail?.candles || [];
  const plan = detail?.trade_plan;
  const isBull = stock?.is_bullish;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
    }}>
      <div className="glass-panel" style={{
        maxWidth: 900, width: '100%', maxHeight: '92vh', overflowY: 'auto',
        border: '1px solid var(--panel-hover-border)', borderRadius: 16, padding: '24px 28px',
        display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 16px 48px rgba(0,0,0,0.6)'
      }}>
        
        {/* Modal Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--panel-border)', pb: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: isBull ? 'var(--bull-bg)' : 'var(--bear-bg)',
              color: isBull ? 'var(--bull-green)' : 'var(--bear-red)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem'
            }}>
              {isBull ? '▲' : '▼'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{symbol}</h3>
                <span className="mono" style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 4 }}>
                  {stock?.sector}
                </span>
                <span className="mono" style={{ fontSize: '0.72rem', background: isBull ? 'var(--bull-bg)' : 'var(--bear-bg)', color: isBull ? 'var(--bull-green)' : 'var(--bear-red)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                  {stock?.rule_status}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stock?.name} • Lot Size: {stock?.lot_size}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
          >
            <X size={22} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--accent-orange)' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
            <p>Loading Order Block Technical Chart & Levels...</p>
          </div>
        ) : !stock ? (
          <p style={{ color: 'var(--bear-red)' }}>Unable to load stock detail.</p>
        ) : (
          <>
            {/* Technical Metrics Ribbon (Exact to Video Frame 8 & 9) */}
            <div className="mono" style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10,
              background: 'rgba(0,0,0,0.4)', padding: '12px 16px', borderRadius: 8, fontSize: '0.75rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>PRICE</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: isBull ? 'var(--bull-green)' : 'var(--bear-red)' }}>
                  ₹{stock.price} ({isBull ? '+' : ''}{stock.change_pct}%)
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>CONVICTION</span>
                <span style={{ fontWeight: 800, color: 'var(--accent-orange)' }}>{stock.conviction_score} / 100</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>DERIVATIVE OI</span>
                <span style={{ fontWeight: 700 }}>{stock.oi_change_pct >= 0 ? '+' : ''}{stock.oi_change_pct}% ({stock.buildup})</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>VOLUME DELTA</span>
                <span style={{ fontWeight: 700 }}>{stock.delta_volume_str}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>VWAP</span>
                <span style={{ fontWeight: 700 }}>₹{stock.vwap} ({stock.vwap_status})</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>OB ZONE</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>₹{stock.ob_zone_str}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>RISK / REWARD</span>
                <span style={{ fontWeight: 800, color: 'var(--bull-green)' }}>{stock.rr_ratio}</span>
              </div>
            </div>

            {/* Candlestick & Order Block Chart */}
            <div style={{ background: 'rgba(5, 8, 14, 0.95)', border: '1px solid var(--panel-border)', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>5-Minute Intraday Session Candles with Order Block Zone</span>
                <div style={{ display: 'flex', gap: 14 }} className="mono">
                  <span style={{ color: '#00E5FF' }}>- - - VWAP</span>
                  <span style={{ color: isBull ? 'var(--bull-green)' : 'var(--bear-red)' }}>■ Order Block Zone</span>
                  <span style={{ color: 'var(--text-muted)' }}>— Support / Resistance</span>
                </div>
              </div>

              {/* SVG Candlestick Engine */}
              <CandlestickSVGChart candles={candles} stock={stock} isBull={isBull} />
            </div>

            {/* Institutional Trade Plan & Execution Card */}
            <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, background: 'rgba(255, 152, 0, 0.04)', borderColor: 'rgba(255, 152, 0, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Shield size={20} style={{ color: 'var(--accent-orange)' }} />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Arya AI Execution Blueprint</h4>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Pre-calculated Institutional Entry, Targets (S1/R1), and Hard Stop Loss
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => setOrderType('OPTIONS')}
                    style={{
                      padding: '4px 10px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                      background: orderType === 'OPTIONS' ? 'var(--accent-orange)' : 'rgba(255,255,255,0.06)',
                      color: orderType === 'OPTIONS' ? '#000' : 'var(--text-secondary)', border: 'none'
                    }}
                  >
                    ATM Options ({plan?.option_contract})
                  </button>
                  <button 
                    onClick={() => setOrderType('FUTURES')}
                    style={{
                      padding: '4px 10px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                      background: orderType === 'FUTURES' ? 'var(--accent-orange)' : 'rgba(255,255,255,0.06)',
                      color: orderType === 'FUTURES' ? '#000' : 'var(--text-secondary)', border: 'none'
                    }}
                  >
                    Futures ({plan?.instrument})
                  </button>
                </div>
              </div>

              {/* Trade Plan Matrix */}
              <div className="mono" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, fontSize: '0.75rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 6 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>ACTION</span>
                  <span style={{ fontWeight: 800, color: plan?.action === 'BUY' ? 'var(--bull-green)' : 'var(--bear-red)' }}>
                    {plan?.action} ({orderType === 'OPTIONS' ? plan?.option_contract : plan?.instrument})
                  </span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 6 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>ENTRY ZONE</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>₹{plan?.entry_zone}</span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 6 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>TARGET 1</span>
                  <span style={{ fontWeight: 700, color: 'var(--bull-green)' }}>₹{plan?.target_1}</span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 6 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>STOP LOSS</span>
                  <span style={{ fontWeight: 700, color: 'var(--bear-red)' }}>₹{plan?.stop_loss}</span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 6 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>CAPITAL (1 LOT)</span>
                  <span style={{ fontWeight: 700 }}>₹{plan?.recommended_capital?.toLocaleString()}</span>
                </div>
              </div>

              {/* 1-Click Execution Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Execution Mode:</span>
                  <button 
                    onClick={() => setTradeMode('paper')}
                    style={{
                      padding: '4px 10px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                      background: tradeMode === 'paper' ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255,255,255,0.06)',
                      color: tradeMode === 'paper' ? 'var(--bull-green)' : 'var(--text-secondary)',
                      border: tradeMode === 'paper' ? '1px solid var(--bull-green)' : 'none'
                    }}
                  >
                    Paper Mode
                  </button>
                  <button 
                    onClick={() => setTradeMode('real')}
                    style={{
                      padding: '4px 10px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                      background: tradeMode === 'real' ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255,255,255,0.06)',
                      color: tradeMode === 'real' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                      border: tradeMode === 'real' ? '1px solid var(--accent-orange)' : 'none'
                    }}
                  >
                    Live Broker (Fyers/Zerodha)
                  </button>
                </div>

                <button 
                  onClick={onExecute}
                  disabled={executing}
                  className="btn-primary"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                    fontSize: '0.85rem', fontWeight: 800,
                    background: plan?.action === 'BUY' 
                      ? 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)' 
                      : 'linear-gradient(135deg, #FF1744 0%, #FF9800 100%)',
                    color: '#000', cursor: 'pointer'
                  }}
                >
                  <Zap size={16} />
                  <span>{executing ? 'Transmitting Order...' : `Execute ${plan?.action} ${orderType}`}</span>
                </button>
              </div>

              {execMessage && (
                <div style={{
                  padding: '8px 14px', borderRadius: 6, fontSize: '0.78rem',
                  background: execMessage.includes('failed') ? 'var(--bear-bg)' : 'var(--bull-bg)',
                  color: execMessage.includes('failed') ? 'var(--bear-red)' : 'var(--bull-green)',
                  border: `1px solid ${execMessage.includes('failed') ? 'var(--bear-red)' : 'var(--bull-green)'}`
                }}>
                  {execMessage}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// ─── High-Fidelity SVG Candlestick Chart ───────────────────────
function CandlestickSVGChart({ candles, stock, isBull }) {
  if (!candles || candles.length === 0) {
    return <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No candle data</div>;
  }

  const width = 820;
  const height = 280;
  const padTop = 20;
  const padBottom = 30;
  const padLeft = 20;
  const padRight = 60;

  // Determine min/max price range across candles + OB + levels
  const allPrices = candles.flatMap(c => [c.high, c.low, c.vwap]);
  if (stock) {
    allPrices.push(stock.ob_low, stock.ob_high, stock.support_1, stock.resistance_1);
  }
  const minP = Math.min(...allPrices) * 0.998;
  const maxP = Math.max(...allPrices) * 1.002;
  const pRange = maxP - minP || 1;

  const getY = (p) => padTop + (1.0 - (p - minP) / pRange) * (height - padTop - padBottom);
  const chartWidth = width - padLeft - padRight;
  const candleStep = chartWidth / candles.length;
  const candleW = Math.max(candleStep * 0.65, 4);

  // Order block vertical boundaries
  const obTopY = getY(stock.ob_high);
  const obBotY = getY(stock.ob_low);
  const obHeight = Math.max(Math.abs(obBotY - obTopY), 6);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 280, overflow: 'visible' }}>
      {/* Background grid lines */}
      {[0.25, 0.5, 0.75].map((pct, idx) => {
        const y = padTop + pct * (height - padTop - padBottom);
        const priceLabel = (maxP - pct * pRange).toFixed(2);
        return (
          <g key={idx}>
            <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <text x={width - padRight + 6} y={y + 4} fill="var(--text-muted)" fontSize="9" fontFamily="JetBrains Mono">
              {priceLabel}
            </text>
          </g>
        );
      })}

      {/* Shaded Order Block Zone */}
      <rect 
        x={padLeft} 
        y={Math.min(obTopY, obBotY)} 
        width={chartWidth} 
        height={obHeight}
        fill={isBull ? 'rgba(0, 230, 118, 0.12)' : 'rgba(255, 23, 68, 0.12)'}
        stroke={isBull ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 23, 68, 0.4)'}
        strokeDasharray="4 2"
      />
      <text x={padLeft + 8} y={Math.min(obTopY, obBotY) + 12} fill={isBull ? 'var(--bull-green)' : 'var(--bear-red)'} fontSize="10" fontWeight="700" fontFamily="JetBrains Mono">
        ORDER BLOCK ZONE ({stock.ob_zone_str})
      </text>

      {/* Support S1 and Resistance R1 Lines */}
      {stock.support_1 && (
        <g>
          <line x1={padLeft} y1={getY(stock.support_1)} x2={width - padRight} y2={getY(stock.support_1)} stroke="rgba(0, 230, 118, 0.6)" strokeWidth="1.2" strokeDasharray="4 4" />
          <text x={width - padRight + 6} y={getY(stock.support_1) + 3} fill="var(--bull-green)" fontSize="9" fontFamily="JetBrains Mono">
            S1 {stock.support_1}
          </text>
        </g>
      )}

      {stock.resistance_1 && (
        <g>
          <line x1={padLeft} y1={getY(stock.resistance_1)} x2={width - padRight} y2={getY(stock.resistance_1)} stroke="rgba(255, 23, 68, 0.6)" strokeWidth="1.2" strokeDasharray="4 4" />
          <text x={width - padRight + 6} y={getY(stock.resistance_1) + 3} fill="var(--bear-red)" fontSize="9" fontFamily="JetBrains Mono">
            R1 {stock.resistance_1}
          </text>
        </g>
      )}

      {/* Candlesticks */}
      {candles.map((c, i) => {
        const cx = padLeft + i * candleStep + candleStep / 2;
        const openY = getY(c.open);
        const closeY = getY(c.close);
        const highY = getY(c.high);
        const lowY = getY(c.low);
        const isUp = c.close >= c.open;
        const color = isUp ? 'var(--bull-green)' : 'var(--bear-red)';

        return (
          <g key={i}>
            {/* Wick */}
            <line x1={cx} y1={highY} x2={cx} y2={lowY} stroke={color} strokeWidth="1.2" />
            {/* Body */}
            <rect 
              x={cx - candleW / 2} 
              y={Math.min(openY, closeY)} 
              width={candleW} 
              height={Math.max(Math.abs(closeY - openY), 2)} 
              fill={color} 
              rx={1}
            />
          </g>
        );
      })}

      {/* VWAP Line */}
      {candles.length > 1 && (
        <polyline 
          fill="none"
          stroke="#00E5FF"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          points={candles.map((c, i) => `${padLeft + i * candleStep + candleStep / 2},${getY(c.vwap)}`).join(' ')}
        />
      )}

      {/* Time axis labels */}
      {candles.filter((_, i) => i % 6 === 0).map((c, idx) => {
        const i = idx * 6;
        const cx = padLeft + i * candleStep + candleStep / 2;
        return (
          <text key={idx} x={cx} y={height - 8} fill="var(--text-muted)" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
            {c.time}
          </text>
        );
      })}
    </svg>
  );
}
