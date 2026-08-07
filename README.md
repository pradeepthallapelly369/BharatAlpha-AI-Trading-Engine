# BharatAlpha AI 📈⚡ — Institutional Stock Market & Algorithmic Options Trading Ecosystem

[![Python 3.12](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Black-Scholes](https://img.shields.io/badge/Options-Black--Scholes_Greeks-FF9800?style=for-the-badge)](https://en.wikipedia.org/wiki/Black%E2%80%93Scholes_model)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**BharatAlpha AI** is an institutional-grade, dual-application stock market platform designed specifically for the **Indian Stock Market (NSE / BSE)**. 

The ecosystem synthesizes **50+ years of institutional investing wisdom** (Value Investing, Quality Compounders, Coffee Can Investing, GARP) with **cutting-edge Quantitative Algorithmic Trading Engines** (Mark Minervini Volatility Contraction Pattern, Black-Scholes Options Greeks, Multi-Leg Strategy Payoffs, and Live Fyers/Zerodha Broker Integration).

---

## 🏗 System Architecture & Ecosystem Overview

The platform operates as **two independent, modular applications**, each equipped with its own REST API backend, reactive UI terminal, and dedicated launcher script:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BHARAT ALPHA AI ECOSYSTEM                             │
│                                                                                 │
│  ┌─────────────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │ 📈 BHARAT ALPHA INVEST               │  │ ⚡ BHARAT ALPHA TRADE            │  │
│  │ (Long-Term & Wealth Building)       │  │ (Options & Futures Terminal)     │  │
│  ├─────────────────────────────────────┤  ├──────────────────────────────────┤  │
│  │ • 🤖 Autonomous Multi-Agent Hub    │  │ • 🤖 Arya AI Options Co-Pilot    │  │
│  │   (Chanakya, Arya, Vikram, Kautilya)│  │ • Live Option Chain with Greeks  │  │
│  │ • AI Screener (VCP + Fundamental)   │  │ • Black-Scholes Delta/Theta/IV   │  │
│  │ • 50-Yr Veteran Investment Memos    │  │ • 7 Preset Multi-Leg Strategies  │  │
│  │ • Technical & Fundamental Engine    │  │ • Interactive Payoff Curve       │  │
│  │ • Mutual Funds Screener (CAGR/AUM)  │  │ • Paper & Real Order Execution   │  │
│  │ • MCX Gold/Silver & SGB Tracker     │  │ • Fyers & Zerodha OAuth Connect  │  │
│  │ • G-Sec Bonds & FD Yield Matrix     │  │ • Real-Time Open Positions & P&L │  │
│  │ • SIP Step-Up Growth Calculator     │  │                                  │  │
│  │ • Risk-Adjusted Asset Allocator     │  │                                  │  │
│  ├─────────────────────────────────────┤  ├──────────────────────────────────┤  │
│  │ Backend: :8000 | Frontend: :5173    │  │ Backend: :8001 | Frontend: :5174 │  │
│  └─────────────────────────────────────┘  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔥 Key Modules & Technical Highlights

### 🤖 Autonomous Multi-Agent AI Suite (Chanakya, Arya, Vikram, Kautilya)
- **Chanakya AI (Wealth & Value Strategist)**: Analyzes fundamentals, Coffee Can compounders, 10Y ROE/ROCE trajectories, and mutual fund CAGR/expense ratios for long-term wealth building.
- **Arya AI (Options Quantitative Specialist)**: Computes Black-Scholes Greeks (Delta, Gamma, Theta, Vega), evaluates IV skew, suggests delta-neutral multi-leg option strategies (Iron Condor, Short Straddle), and triggers automated Paper/Real order execution.
- **Vikram AI (Swing & Momentum Trader)**: Scans for Mark Minervini Volatility Contraction Patterns (VCP), 20/50/200 EMA trend alignment, breakout volume surges, and RSI momentum confirmation.
- **Kautilya AI (Risk & Portfolio Guardian)**: Enforces position sizing rules, max capital risk limits, diversification constraints, and stop-loss management.

### 📈 Application 1: BharatAlpha Invest (Long-Term Wealth Building)
- **Institutional Quantitative Screener**: Parallel screening across NSE stock universes applying Mark Minervini Volatility Contraction Pattern (VCP) detection, RSI momentum divergence, 20/50/200-day EMA trends, and volume ratio surges.
- **50-Year Veteran Consensus Engine**: Synthesizes fundamental financial metrics (ROE, ROCE, P/E, PEG, Debt-to-Equity, Profit Margins) into comprehensive institutional research memos complete with conviction ratings and actionable trade execution blueprints.
- **Mutual Funds Analytics Engine**: Category-wise screening across Flexi Cap, Large Cap, Mid Cap, Small Cap, Index, Aggressive Hybrid, and Debt funds with 1Y/3Y/5Y CAGR, NAV, Expense Ratio, and AUM metrics.
- **Gold, Silver & Commodities Tracker**: Live MCX Gold (24K & 22K) & Silver prices plus secondary market matrix for Sovereign Gold Bonds (SGB) series yields and tax-free redemption schedules.
- **Fixed Income & Bonds Matrix**: Tracks RBI 10-Year G-Sec benchmark yields, Treasury Bills (T-Bills), Corporate AAA NCD bonds, and Bank Fixed Deposit comparison tables.
- **SIP Compounder & Asset Allocation Advisor**: Computes compound growth with annual step-up % and generates age/risk-profile asset allocation splits.

### ⚡ Application 2: BharatAlpha Trade (Options & Futures Terminal)
- **Black-Scholes Options Greeks Engine**: Real-time calculation of **Delta, Gamma, Theta, Vega, Rho**, and **Implied Volatility (IV)** using Newton-Raphson root finding across NIFTY and BANKNIFTY option chains.
- **7 Multi-Leg Option Strategy Templates**: Preset templates for **Short Straddle, Short Strangle, Iron Condor, Bull Call Spread, Bear Put Spread, Jade Lizard**, and **Long Straddle**.
- **Interactive Payoff Diagram Generator**: Visualizes expiry profit/loss curves, max profit, max risk, and breakeven points for multi-leg option orders.
- **Paper & Real Trading Engine**: Supports Paper Trading (virtual ₹5,00,000 margin, live fill engine) and Real Broker execution via Fyers/Zerodha OAuth.
- **Fyers & Zerodha Broker API Connectors**: Production-ready OAuth authentication and multi-leg order execution modules for Fyers API v3 and Zerodha Kite Connect.

---

## 🛠 Technology Stack

- **Backend**: Python 3.12, FastAPI, Pandas, NumPy, SciPy (Black-Scholes cumulative distribution & IV optimization), YFinance, PyYAML.
- **Frontend**: React 18, Vite, Lucide Icons, Chart.js, HTML5 Canvas, Vanilla CSS3 (Custom Glassmorphism Design System).
- **Broker APIs**: `fyers-apiv3`, `kiteconnect`, `python-dotenv`.
- **System**: Linux / Bash automation, background process management.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Clone Repository
```bash
git clone https://github.com/pradeepthallapelly369/BharatAlpha-AI-Trading-Engine.git
cd BharatAlpha-AI-Trading-Engine
```

### 2. Setup Python Environment & Dependencies
```bash
python3 -m venv venv
source venv/bin/pip install -r requirements.txt # or install fastapi uvicorn pandas numpy scipy fyers-apiv3 kiteconnect python-dotenv yfinance
```

### 3. Launch Both Applications with One Command
```bash
chmod +x launch_all.sh
./launch_all.sh
```

- **BharatAlpha Invest UI**: `http://localhost:5173` (API Docs: `http://localhost:8000/docs`)
- **BharatAlpha Trade UI**: `http://localhost:5174` (API Docs: `http://localhost:8001/docs`)

---

## 🌐 API Endpoint Reference

### BharatAlpha Invest API (Port `:8000`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/market-pulse` | Live Nifty 50, Bank Nifty, Sensex indices & FII/DII institutional flow |
| `GET` | `/api/screener` | Real-time quantitative stock recommendations (Long-Term & Short-Term VCP) |
| `GET` | `/api/stock/{ticker}` | 360° Stock analysis with 50-Year Veteran AI Memo & Trade Blueprint |
| `GET` | `/api/stock/{ticker}/chart` | Daily OHLC price series with 20/50 EMA technical indicators |
| `GET` | `/api/invest/mutual-funds` | Category-wise mutual fund screening with CAGR, NAV & AUM |
| `GET` | `/api/invest/commodities-bonds` | Live Gold/Silver prices, SGB tranches, G-Sec yields & Bank FDs |
| `POST` | `/api/invest/sip-calculator` | Monthly SIP wealth projection with step-up % |
| `POST` | `/api/invest/portfolio-allocation` | Age & risk profile asset allocation recommendations |

### BharatAlpha Trade API (Port `:8001`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/options/chain/{symbol}` | Live Nifty / Bank Nifty option chain enriched with Black-Scholes Greeks |
| `GET` | `/api/options/strategies` | Catalog of preset multi-leg option strategies |
| `POST` | `/api/options/strategy` | Analyze strategy legs, breakevens, and payoff curve dataset |
| `POST` | `/api/options/execute` | Execute multi-leg option orders (Paper Trading or Live Broker) |
| `GET` | `/api/broker/status` | Connection status for Fyers and Zerodha brokers |
| `GET` | `/api/broker/positions` | Real-time open option positions and P&L tracking |

---

## 👨‍💻 Author & Contact

**Pradeep Thallapelly**  
*Senior AI & Data Engineer / Quantitative Systems Architect*  
- **GitHub**: [@pradeepthallapelly369](https://github.com/pradeepthallapelly369)

---
*Built with ❤️ for Indian Capital Markets (NSE/BSE)*
