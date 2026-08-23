import yfinance as yf
import pandas as pd
import json
import os
from backend.engine.technicals import analyze_stock_technicals
from backend.engine.fundamentals import analyze_stock_fundamentals
from backend.engine.trade_planner import generate_trade_plan

DYNAMIC_UNIVERSE_PATH = os.path.join(os.path.dirname(__file__), "engine", "dynamic_universes.json")
DYNAMIC_5000_CR_UNIVERSE = []
if os.path.exists(DYNAMIC_UNIVERSE_PATH):
    try:
        with open(DYNAMIC_UNIVERSE_PATH, "r") as f:
            data = json.load(f)
            DYNAMIC_5000_CR_UNIVERSE = data.get("universe", [])
    except Exception as e:
        print(f"Error loading dynamic universe: {e}")

DEFAULT_NSE_UNIVERSE = [
    "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS",
    "DIXON.NS", "TATAELXSI.NS", "LT.NS", "SBIN.NS", "BAJFINANCE.NS",
    "SUNPHARMA.NS", "BHARTIARTL.NS", "ITC.NS", "TRENT.NS", "BEL.NS",
    "HAL.NS", "POLYCAB.NS", "VBL.NS", "KAYNES.NS", "TATASTEEL.NS"
]

NIFTY_50_UNIVERSE = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "ICICIBANK.NS", "BHARTIARTL.NS", "INFY.NS", "ITC.NS", "SBIN.NS", "LT.NS", "BAJFINANCE.NS", "KOTAKBANK.NS", "AXISBANK.NS", "TATAMOTORS.NS", "SUNPHARMA.NS"]
NIFTY_NEXT_50_UNIVERSE = ["TRENT.NS", "BEL.NS", "HAL.NS", "CHOLAFIN.NS", "TVSMOTOR.NS", "INDIGO.NS", "ZOMATO.NS", "JINDALSTEL.NS", "HDFCAMC.NS", "BOSCHLTD.NS", "COLPAL.NS", "SIEMENS.NS"]
NIFTY_MIDCAP_UNIVERSE = ["DIXON.NS", "POLYCAB.NS", "KAYNES.NS", "APARINDS.NS", "KPITTECH.NS", "PERSISTENT.NS", "SUZLON.NS", "BSE.NS", "CUMMINSIND.NS", "LUPIN.NS", "OFSS.NS", "IDEA.NS"]
NIFTY_SMALLCAP_UNIVERSE = ["ANGELONE.NS", "CDSL.NS", "CAMS.NS", "CYIENT.NS", "BİRSOFT.NS", "RENUKA.NS", "UJJIVANSFB.NS", "NBCC.NS", "WELCORP.NS", "RAYMOND.NS", "EQUITASBNK.NS"]
NIFTY_MICROCAP_UNIVERSE = ["SUBROS.NS", "RPOWER.NS", "ZENTEC.NS", "AVANTIFEED.NS", "MARKSANS.NS", "GMDCLTD.NS", "GRAVITA.NS", "WOCKPHARMA.NS", "GTLINFRA.NS", "PCJEWELLER.NS"]

SECTORAL_IT_UNIVERSE = ["TCS.NS", "INFY.NS", "HCLTECH.NS", "WIPRO.NS", "LTIM.NS", "TECHM.NS", "PERSISTENT.NS", "COFORGE.NS"]
SECTORAL_BANK_UNIVERSE = ["HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "AXISBANK.NS", "KOTAKBANK.NS", "INDUSINDBK.NS", "PNB.NS", "BANKBARODA.NS", "FEDERALBNK.NS"]
SECTORAL_AUTO_UNIVERSE = ["TATAMOTORS.NS", "M&M.NS", "MARUTI.NS", "BAJAJ-AUTO.NS", "HEROMOTOCO.NS", "EICHERMOT.NS", "TVSMOTOR.NS", "ASHOKLEY.NS"]
SECTORAL_PHARMA_UNIVERSE = ["SUNPHARMA.NS", "CIPLA.NS", "DRREDDY.NS", "DIVISLAB.NS", "APOLLOHOSP.NS", "LUPIN.NS", "AUROPHARMA.NS", "BIOCON.NS"]
SECTORAL_INFRA_UNIVERSE = ["LT.NS", "ADANIPORTS.NS", "NTPC.NS", "POWERGRID.NS", "ONGC.NS", "COALINDIA.NS", "ULTRACEMCO.NS", "GRASIM.NS", "AMBUJACEM.NS"]

UNIVERSES_DICT = {
    "DEFAULT": DEFAULT_NSE_UNIVERSE,
    "NIFTY_50": NIFTY_50_UNIVERSE,
    "NIFTY_NEXT_50": NIFTY_NEXT_50_UNIVERSE,
    "NIFTY_MIDCAP": NIFTY_MIDCAP_UNIVERSE,
    "NIFTY_SMALLCAP": NIFTY_SMALLCAP_UNIVERSE,
    "NIFTY_MICROCAP": NIFTY_MICROCAP_UNIVERSE,
    "SECTORAL_IT": SECTORAL_IT_UNIVERSE,
    "SECTORAL_BANK": SECTORAL_BANK_UNIVERSE,
    "SECTORAL_AUTO": SECTORAL_AUTO_UNIVERSE,
    "SECTORAL_PHARMA": SECTORAL_PHARMA_UNIVERSE,
    "SECTORAL_INFRA": SECTORAL_INFRA_UNIVERSE,
    "DYNAMIC_5000CR": DYNAMIC_5000_CR_UNIVERSE if DYNAMIC_5000_CR_UNIVERSE else DEFAULT_NSE_UNIVERSE
}

def run_screener_scan(tickers=None) -> dict:
    """
    Executes full quantitative screening scan across NSE universe.
    Separates picks into Long-Term Investing and Short-Term Trading recommendations.
    """
    if not tickers:
        tickers = DEFAULT_NSE_UNIVERSE

    long_term_picks = []
    short_term_picks = []
    
    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            df = stock.history(period="1y").dropna(subset=['Close'])
            if df.empty or len(df) < 30:
                continue
                
            tech = analyze_stock_technicals(df)
            fund = analyze_stock_fundamentals(ticker)
            plan = generate_trade_plan(tech, fund, ticker)
            
            clean_symbol = ticker.replace(".NS", "").replace(".BO", "")
            
            record = {
                "ticker": clean_symbol,
                "full_symbol": ticker,
                "current_price": tech.get("current_price"),
                "change_pct": tech.get("change_pct"),
                "sector": fund.get("sector"),
                "quality_score": fund.get("quality_score"),
                "technical_score": tech.get("technical_score"),
                "valuation_score": fund.get("valuation_score"),
                "veteran_score": plan.get("veteran_score"),
                "conviction_stars": plan.get("conviction_stars"),
                "action": plan.get("action"),
                "horizon": plan.get("horizon"),
                "entry_zone": plan.get("entry_zone"),
                "stop_loss": plan.get("stop_loss"),
                "target_1": plan.get("target_1"),
                "target_2": plan.get("target_2"),
                "risk_reward": plan.get("risk_reward_ratio"),
                "category": fund.get("category"),
                "vcp_active": tech.get("vcp", {}).get("is_vcp", False),
                "trend_status": tech.get("trend_status")
            }
            
            # Long-Term Criteria: High Quality + Good Valuation / Coffee Can / GARP
            if fund.get("quality_score", 0) >= 60 or fund.get("category") in ["COFFEE_CAN_COMPOUNDER", "GARP_BUY", "DEEP_VALUE_BARGAIN"]:
                long_term_picks.append(record)
                
            # Short-Term Criteria: High Technical Score + Bullish Trend or VCP Breakout
            if tech.get("technical_score", 0) >= 60 or tech.get("vcp", {}).get("is_vcp"):
                short_term_picks.append(record)
                
        except Exception as e:
            print(f"Error screening {ticker}: {e}")
            continue

    # Sort long term by quality & veteran score
    long_term_picks.sort(key=lambda x: x["veteran_score"], reverse=True)
    # Sort short term by technical score
    short_term_picks.sort(key=lambda x: x["technical_score"], reverse=True)

    return {
        "total_scanned": len(tickers),
        "long_term_picks": long_term_picks,
        "short_term_picks": short_term_picks
    }
