#!/usr/bin/env bash
# ============================================================
#  BharatAlpha AI Ecosystem — Master Launcher
#  Launches both Invest (:8000 / :5173) and Trade (:8001 / :5174)
# ============================================================

set -e

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_UVICORN="/home/upc/every_thing_claude/venv_bt/bin/uvicorn"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║            BHARAT ALPHA AI DUAL-APP TRADING PLATFORM          ║"
echo "║   📈 Invest Dashboard (:5173)  |  ⚡ Options Terminal (:5174)   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ── Clean stale ports ───────────────────────────────────────────
fuser -k 8000/tcp 8001/tcp 5173/tcp 5174/tcp 2>/dev/null || true
sleep 1

# ── Launch Invest App ───────────────────────────────────────────
echo "🚀 Launching BharatAlpha Invest Backend (:8000)..."
cd "$BASE_DIR/bharat_alpha"
PYTHONPATH="$BASE_DIR/bharat_alpha" "$VENV_UVICORN" backend.main:app --host 0.0.0.0 --port 8000 > /tmp/invest_be.log 2>&1 &
INVEST_BE_PID=$!

echo "🎨 Launching BharatAlpha Invest Frontend (:5173)..."
cd "$BASE_DIR/bharat_alpha/frontend"
npm run dev -- --port 5173 --host 0.0.0.0 > /tmp/invest_fe.log 2>&1 &
INVEST_FE_PID=$!

# ── Launch Trade App ────────────────────────────────────────────
echo "🚀 Launching BharatAlpha Trade Backend (:8001)..."
cd "$BASE_DIR/bharat_alpha_trade"
PYTHONPATH="$BASE_DIR/bharat_alpha_trade" "$VENV_UVICORN" backend.main:app --host 0.0.0.0 --port 8001 > /tmp/trade_be.log 2>&1 &
TRADE_BE_PID=$!

echo "🎨 Launching BharatAlpha Trade Frontend (:5174)..."
cd "$BASE_DIR/bharat_alpha_trade/frontend"
npm run dev -- --port 5174 --host 0.0.0.0 > /tmp/trade_fe.log 2>&1 &
TRADE_FE_PID=$!

sleep 4

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  ✅ Both BharatAlpha Applications are LIVE!"
echo ""
echo "  📈 BharatAlpha Invest : http://localhost:5173  (API: :8000)"
echo "  ⚡ BharatAlpha Trade  : http://localhost:5174  (API: :8001)"
echo ""
echo "  Press Ctrl+C to shut down all servers."
echo "════════════════════════════════════════════════════════════════"

cleanup() {
    echo ""
    echo "🛑 Shutting down BharatAlpha AI Platform..."
    kill $INVEST_BE_PID $INVEST_FE_PID $TRADE_BE_PID $TRADE_FE_PID 2>/dev/null || true
    fuser -k 8000/tcp 8001/tcp 5173/tcp 5174/tcp 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

wait
