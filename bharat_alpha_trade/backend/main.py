"""
BharatAlpha Trade ⚡ — Options & Futures Trading Terminal API
FastAPI backend on port 8001
"""
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os, math
import numpy as np

from dotenv import load_dotenv
load_dotenv()

from backend.broker.fyers_connector import fyers_broker
from backend.broker.zerodha_connector import zerodha_broker
from backend.engine.options_greeks import (
    enrich_option_chain_with_greeks, calculate_all_greeks,
    solve_implied_volatility, days_to_expiry_fraction, RISK_FREE_RATE
)
from backend.engine.options_strategies import (
    STRATEGY_CATALOG, analyze_strategy, build_strategy_legs, calculate_payoff_at_expiry
)

app = FastAPI(title="BharatAlpha Trade ⚡ — Options & Futures Terminal", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def sanitize(obj):
    """Recursively sanitize numpy/nan values for JSON serialization."""
    if isinstance(obj, dict):
        return {k: sanitize(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize(x) for x in obj]
    elif isinstance(obj, (float, np.floating)):
        if math.isnan(obj) or math.isinf(obj):
            return 0.0
        return float(obj)
    elif isinstance(obj, (int, np.integer)):
        return int(obj)
    elif isinstance(obj, (bool, np.bool_)):
        return bool(obj)
    return obj

# ─── Paper Trading State ───────────────────────────────────
paper_positions = []
paper_pnl = 0.0

class StrategyRequest(BaseModel):
    strategy_key: str
    spot_price: float
    lot_size: int = 25
    strike_step: int = 50

class OrderLeg(BaseModel):
    action: str  # BUY or SELL
    type: str    # CE or PE
    strike: int
    qty: int
    premium: float

class ExecuteRequest(BaseModel):
    legs: List[OrderLeg]
    lot_size: int = 25
    mode: str = "paper"  # paper | live
    broker: str = "fyers"

# ─── Broker Auth Endpoints ──────────────────────────────────

@app.get("/api/broker/login/{broker}")
def broker_login(broker: str):
    """Get OAuth login URL for Fyers or Zerodha."""
    if broker == "fyers":
        return sanitize(fyers_broker.get_login_url())
    elif broker == "zerodha":
        return sanitize(zerodha_broker.get_login_url())
    raise HTTPException(status_code=400, detail="Supported brokers: fyers, zerodha")

@app.get("/api/broker/callback")
def broker_callback(auth_code: str = Query(None), s: str = Query(None), code: str = Query(None)):
    """Handle OAuth redirect callback."""
    token = auth_code or code
    if not token:
        raise HTTPException(status_code=400, detail="No auth_code received")
    state = s or "fyers"
    if "zerodha" in state.lower():
        return sanitize(zerodha_broker.generate_token(token))
    return sanitize(fyers_broker.generate_token(token))

@app.get("/api/broker/status")
def broker_status():
    """Check which brokers are connected."""
    return {
        "fyers": {
            "connected": fyers_broker.is_connected(),
            "has_credentials": bool(fyers_broker.client_id),
        },
        "zerodha": {
            "connected": zerodha_broker.is_connected(),
            "has_credentials": bool(zerodha_broker.api_key),
        },
        "trading_mode": os.getenv("TRADING_MODE", "paper"),
    }

# ─── Option Chain Endpoint ──────────────────────────────────

@app.get("/api/options/chain/{symbol}")
def get_option_chain(symbol: str = "NIFTY"):
    """Get live option chain with Greeks for NIFTY or BANKNIFTY."""
    sym_map = {
        "NIFTY": "NSE:NIFTY50-INDEX",
        "BANKNIFTY": "NSE:NIFTYBANK-INDEX",
    }
    fyers_symbol = sym_map.get(symbol.upper(), f"NSE:{symbol.upper()}-INDEX")

    raw = fyers_broker.get_option_chain(fyers_symbol)
    chain = raw.get("chain", [])
    spot = raw.get("spot_price", 24600)
    dte = raw.get("days_to_expiry", 7)
    lot_size = raw.get("lot_size", 25)
    strike_step = raw.get("strike_step", 50)

    enriched = enrich_option_chain_with_greeks(chain, spot, dte)

    return sanitize({
        "status": "success",
        "symbol": symbol.upper(),
        "spot_price": spot,
        "lot_size": lot_size,
        "strike_step": strike_step,
        "expiry": raw.get("expiry", "N/A"),
        "days_to_expiry": dte,
        "source": raw.get("source", "live"),
        "chain": enriched
    })

# ─── Strategy Builder Endpoint ───────────────────────────────

@app.get("/api/options/strategies")
def list_strategies():
    """List all available preset strategy templates."""
    return sanitize({
        "status": "success",
        "strategies": [
            {"key": k, **v} for k, v in STRATEGY_CATALOG.items()
        ]
    })

@app.post("/api/options/strategy")
def build_strategy(req: StrategyRequest):
    """Build and analyze a strategy with payoff curve."""
    result = analyze_strategy(
        req.strategy_key, req.spot_price, req.lot_size, req.strike_step
    )
    return sanitize({"status": "success", "data": result})

# ─── Order Execution Endpoint ────────────────────────────────

@app.post("/api/options/execute")
def execute_order(req: ExecuteRequest):
    """Execute multi-leg option order via broker or paper trading."""
    global paper_positions, paper_pnl

    if req.mode == "paper":
        # Paper trading — simulate execution
        executed_legs = []
        for leg in req.legs:
            entry = {
                "action": leg.action,
                "type": leg.type,
                "strike": leg.strike,
                "qty": leg.qty * req.lot_size,
                "premium": leg.premium,
                "status": "FILLED",
                "fill_price": leg.premium,
                "timestamp": __import__("datetime").datetime.now().isoformat(),
            }
            paper_positions.append(entry)
            executed_legs.append(entry)

        net_credit = sum(
            l.premium * req.lot_size if l.action == "SELL" else -l.premium * req.lot_size
            for l in req.legs
        )

        return sanitize({
            "status": "success",
            "mode": "paper",
            "message": f"Paper trade executed successfully! {len(req.legs)} legs filled.",
            "net_credit_debit": round(net_credit, 2),
            "executed_legs": executed_legs,
        })
    else:
        # Live execution via Fyers
        if not fyers_broker.is_connected():
            raise HTTPException(status_code=401, detail="Fyers not connected. Login first.")
        results = []
        for leg in req.legs:
            sym = f"NSE:NIFTY{leg.strike}{leg.type}"
            side = 1 if leg.action == "BUY" else -1
            resp = fyers_broker.place_order(sym, leg.qty * req.lot_size, side)
            results.append(resp)
        return sanitize({"status": "success", "mode": "live", "orders": results})

# ─── Positions & P&L Endpoint ────────────────────────────────

@app.get("/api/broker/positions")
def get_positions():
    """Get current positions from broker or paper trading."""
    mode = os.getenv("TRADING_MODE", "paper")
    if mode == "paper":
        return sanitize({
            "status": "success",
            "mode": "paper",
            "positions": paper_positions,
            "total_positions": len(paper_positions),
        })
    if fyers_broker.is_connected():
        return sanitize(fyers_broker.get_positions())
    return {"status": "success", "positions": [], "message": "No broker connected"}

from backend.engine.agent_hub import TradeAgentEngine

trade_agent = TradeAgentEngine()

class AgentChatReq(BaseModel):
    query: str
    agent: str = "arya"

class AgentExecReq(BaseModel):
    symbol: str = "NIFTY"
    action: str = "BUY"
    mode: str = "paper"
    broker: str = "fyers"
    strategy: str = "SHORT_STRADDLE"
    qty: int = 25
    strike: int = 24600
    type: str = "CE"

@app.post("/api/agent/chat")
def trade_agent_chat(req: AgentChatReq):
    """Chat with Options AI Agent (Arya) for live Greeks analysis & strategy recommendations."""
    return sanitize(trade_agent.process_chat(req.query, req.agent))

@app.post("/api/agent/execute")
def trade_agent_execute(req: AgentExecReq):
    """Execute paper or real broker trade directly triggered by AI Agent."""
    return sanitize(trade_agent.execute_trade(req.dict()))

