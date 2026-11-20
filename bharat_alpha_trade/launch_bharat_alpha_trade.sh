#!/usr/bin/env bash
# ============================================================
#  BharatAlpha Trade ⚡ — One-Click Launcher
#  Starts FastAPI Options Backend (port 8001) + Vite UI (port 5174)
#  then opens the options terminal in the default browser.
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
FRONTEND_DIR="${PROJECT_DIR}/frontend"
LOG_DIR="${PROJECT_DIR}/logs"

mkdir -p "$LOG_DIR"

# Locate python & uvicorn dynamically
if [ -x "/home/upc/pradeep-workspace/src/apps/GlobalCareer-AI-Engine/venv/bin/uvicorn" ]; then
    VENV_PYTHON="/home/upc/pradeep-workspace/src/apps/GlobalCareer-AI-Engine/venv/bin/python3"
    VENV_UVICORN="/home/upc/pradeep-workspace/src/apps/GlobalCareer-AI-Engine/venv/bin/uvicorn"
elif [ -x "/home/upc/venv/bin/uvicorn" ]; then
    VENV_PYTHON="/home/upc/venv/bin/python3"
    VENV_UVICORN="/home/upc/venv/bin/uvicorn"
elif [ -x "/home/upc/every_thing_claude/archive/dev_envs/venv_bt/bin/python3" ]; then
    VENV_PYTHON="/home/upc/every_thing_claude/archive/dev_envs/venv_bt/bin/python3"
    VENV_UVICORN="/home/upc/every_thing_claude/archive/dev_envs/venv_bt/bin/uvicorn"
elif [ -x "/home/upc/every_thing_claude/venv_bt/bin/python3" ]; then
    VENV_PYTHON="/home/upc/every_thing_claude/venv_bt/bin/python3"
    VENV_UVICORN="/home/upc/every_thing_claude/venv_bt/bin/uvicorn"
elif command -v uvicorn >/dev/null 2>&1; then
    VENV_PYTHON="$(which python3)"
    VENV_UVICORN="uvicorn"
else
    VENV_PYTHON="$(which python3)"
    VENV_UVICORN="python3 -m uvicorn"
fi

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   BharatAlpha Trade ⚡ — Options & Algo-Trading Terminal ║"
echo "║   OrderBlock Screener, Market Breadth & Greeks Engine    ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── Kill any stale processes on our ports ──────────────────────
fuser -k 8001/tcp 2>/dev/null || true
fuser -k 5174/tcp 2>/dev/null || true
sleep 1

# ── 1. Start FastAPI Backend (port 8001) ──────────────────────
echo "🚀 Starting Options Terminal Backend on http://localhost:8001 ..."
cd "$PROJECT_DIR"
PYTHONPATH="$PROJECT_DIR" "$VENV_UVICORN" backend.main:app \
    --host 0.0.0.0 --port 8001 \
    > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# ── 2. Start Vite Frontend (port 5174) ────────────────────────
echo "🎨 Starting Options Dashboard UI on http://localhost:5174 ..."
cd "$FRONTEND_DIR"
npm run dev -- --host 0.0.0.0 --port 5174 > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
sleep 1.5
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "   Dev server hit watcher limit; launching Vite preview..."
    npx vite preview --host 0.0.0.0 --port 5174 > "$LOG_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
fi
echo "   Frontend PID: $FRONTEND_PID"

# ── 3. Wait for servers to be ready ───────────────────────────
echo ""
echo "⏳ Waiting for trading servers to come online..."
sleep 4

# ── 4. Open browser ───────────────────────────────────────────
echo "🌐 Opening BharatAlpha Trade Dashboard in browser..."
xdg-open "http://localhost:5174" 2>/dev/null || \
  sensible-browser "http://localhost:5174" 2>/dev/null || \
  echo "   Open http://localhost:5174 in your browser manually."

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  ⚡ BharatAlpha Trade is LIVE!"
echo "     Dashboard : http://localhost:5174"
echo "     API Docs  : http://localhost:8001/docs"
echo ""
echo "  Press Ctrl+C to shut down both servers."
echo "════════════════════════════════════════════════════════════"

# ── Trap Ctrl+C to cleanly kill both processes ─────────────────
cleanup() {
    echo ""
    echo "🛑 Shutting down BharatAlpha Trade..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    fuser -k 8001/tcp 2>/dev/null || true
    fuser -k 5174/tcp 2>/dev/null || true
    echo "   Goodbye! 👋"
    exit 0
}

trap cleanup SIGINT SIGTERM

wait
