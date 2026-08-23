import yfinance as yf
import pandas as pd
import requests
import json
import os
import concurrent.futures
from datetime import datetime

# URL for NSE all equity list
NSE_EQUITY_URL = "https://archives.nseindia.com/content/equities/EQUITY_L.csv"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "dynamic_universes.json")

def get_all_nse_symbols():
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(NSE_EQUITY_URL, headers=headers, timeout=10)
        
        # If the direct NSE link fails, fallback to a known large list or use a cached version
        if response.status_code != 200:
            print("Failed to fetch from NSE, using fallback list.")
            return get_fallback_symbols()
            
        lines = response.text.strip().split('\n')
        symbols = []
        for i, line in enumerate(lines):
            if i == 0: continue # Skip header
            parts = line.split(',')
            if len(parts) > 0:
                symbols.append(parts[0].strip() + ".NS")
        return symbols
    except Exception as e:
        print(f"Error fetching NSE symbols: {e}")
        return get_fallback_symbols()

def get_fallback_symbols():
    # A generous fallback list of popular symbols if NSE is unreachable
    # In a real scenario, this would be a local cached file of all 2000+ symbols.
    return [
        "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "ICICIBANK.NS", "INFY.NS", "ITC.NS", "SBIN.NS",
        "BHARTIARTL.NS", "BAJFINANCE.NS", "LICINDIA.NS", "L&T.NS", "HUL.NS", "KOTAKBANK.NS",
        "AXISBANK.NS", "NTPC.NS", "TATAMOTORS.NS", "SUNPHARMA.NS", "ONGC.NS", "TITAN.NS",
        "POWERGRID.NS", "COALINDIA.NS", "TATASTEEL.NS", "ASIANPAINT.NS", "BAJAJFINSV.NS",
        "MARUTI.NS", "ADANIPORTS.NS", "GRASIM.NS", "WIPRO.NS", "JSWSTEEL.NS", "HCLTECH.NS"
        # Truncated for fallback
    ]

def fetch_market_cap(symbol):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        mcap = info.get('marketCap', 0)
        return symbol, mcap
    except:
        return symbol, 0

def refresh_universe(min_market_cap_cr=5000):
    print(f"Starting daily universe refresh. Minimum Market Cap: ₹{min_market_cap_cr} Cr")
    symbols = get_all_nse_symbols()
    print(f"Found {len(symbols)} total NSE equity symbols. Fetching market caps...")
    
    # 5000 Cr INR is approx 50,000,000,000 INR
    min_market_cap_inr = min_market_cap_cr * 10000000
    
    valid_symbols = []
    
    # Fetch in parallel to speed up (using max 20 threads to avoid rate limits)
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(fetch_market_cap, sym): sym for sym in symbols}
        
        for i, future in enumerate(concurrent.futures.as_completed(futures)):
            sym, mcap = future.result()
            if mcap >= min_market_cap_inr:
                valid_symbols.append(sym)
                
            if i % 100 == 0 and i > 0:
                print(f"Processed {i}/{len(symbols)} stocks...")
                
    print(f"Refresh complete. Found {len(valid_symbols)} stocks above ₹{min_market_cap_cr} Cr.")
    
    data = {
        "last_updated": datetime.now().isoformat(),
        "min_market_cap_cr": min_market_cap_cr,
        "total_stocks": len(valid_symbols),
        "universe": valid_symbols
    }
    
    with open(OUTPUT_FILE, "w") as f:
        json.dump(data, f, indent=4)
        
    return data

if __name__ == "__main__":
    refresh_universe(5000)
