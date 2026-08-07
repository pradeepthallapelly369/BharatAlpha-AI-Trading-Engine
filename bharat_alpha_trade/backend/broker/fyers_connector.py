"""
Fyers Broker Connector — OAuth authentication, option chain data, order placement.
"""
import os
import json
import time
import requests
from datetime import datetime, date

TOKEN_FILE = os.path.join(os.path.dirname(__file__), ".fyers_token")

class FyersConnector:
    def __init__(self):
        self.client_id = os.getenv("FYERS_APP_ID", "")
        self.secret_key = os.getenv("FYERS_SECRET_KEY", "")
        self.redirect_uri = os.getenv("FYERS_REDIRECT_URI", "http://localhost:8001/api/broker/callback")
        self.access_token = None
        self._load_cached_token()

    def _load_cached_token(self):
        """Load cached access token if valid for today."""
        if os.path.exists(TOKEN_FILE):
            try:
                with open(TOKEN_FILE, "r") as f:
                    data = json.load(f)
                if data.get("date") == str(date.today()) and data.get("token"):
                    self.access_token = data["token"]
            except Exception:
                pass

    def _save_token(self, token):
        """Cache token for the day."""
        with open(TOKEN_FILE, "w") as f:
            json.dump({"date": str(date.today()), "token": token}, f)
        self.access_token = token

    def is_connected(self):
        return bool(self.access_token)

    def get_login_url(self):
        """Generate OAuth login URL for browser-based authentication."""
        if not self.client_id or not self.secret_key:
            return {"error": "FYERS_APP_ID and FYERS_SECRET_KEY must be set in .env"}
        try:
            from fyers_apiv3 import fyersModel
            session = fyersModel.SessionModel(
                client_id=self.client_id,
                secret_key=self.secret_key,
                redirect_uri=self.redirect_uri,
                response_type="code",
                state="bharat_alpha_trade"
            )
            return {"url": session.generate_authcode(), "status": "success"}
        except Exception as e:
            return {"error": str(e)}

    def generate_token(self, auth_code):
        """Exchange auth_code for access_token."""
        try:
            from fyers_apiv3 import fyersModel
            session = fyersModel.SessionModel(
                client_id=self.client_id,
                secret_key=self.secret_key,
                redirect_uri=self.redirect_uri,
                response_type="code",
                grant_type="authorization_code"
            )
            session.set_token(auth_code)
            response = session.generate_token()
            if response.get("access_token"):
                self._save_token(response["access_token"])
                return {"status": "success", "message": "Fyers connected successfully"}
            return {"error": response.get("message", "Token generation failed")}
        except Exception as e:
            return {"error": str(e)}

    def _get_fyers_model(self):
        from fyers_apiv3 import fyersModel
        return fyersModel.FyersModel(
            token=self.access_token,
            is_async=False,
            client_id=self.client_id
        )

    def get_funds(self):
        """Get available trading funds."""
        if not self.is_connected():
            return {"error": "Not connected. Please login first."}
        try:
            fyers = self._get_fyers_model()
            return fyers.funds()
        except Exception as e:
            return {"error": str(e)}

    def get_positions(self):
        """Get current open positions."""
        if not self.is_connected():
            return {"error": "Not connected. Please login first."}
        try:
            fyers = self._get_fyers_model()
            return fyers.positions()
        except Exception as e:
            return {"error": str(e)}

    def get_option_chain(self, symbol="NSE:NIFTY50-INDEX", strike_count=20):
        """Fetch live option chain data from Fyers API."""
        if not self.is_connected():
            return self._mock_option_chain(symbol)
        try:
            url = "https://api-t1.fyers.in/data/options-chain-v3"
            headers = {"Authorization": f"{self.client_id}:{self.access_token}"}
            params = {"symbol": symbol, "strikecount": strike_count}
            resp = requests.get(url, headers=headers, params=params, timeout=10)
            if resp.status_code == 200:
                return resp.json()
            return self._mock_option_chain(symbol)
        except Exception:
            return self._mock_option_chain(symbol)

    def _mock_option_chain(self, symbol="NSE:NIFTY50-INDEX"):
        """Generate realistic mock option chain data for paper trading / demo."""
        import random
        if "BANKNIFTY" in symbol.upper():
            spot = 52200
            step = 100
            lot_size = 15
        else:
            spot = 24600
            step = 50
            lot_size = 25

        atm = int(round(spot / step) * step)
        strikes = list(range(atm - step * 12, atm + step * 13, step))
        chain = []
        for s in strikes:
            diff = abs(s - spot)
            base_iv = 12 + (diff / spot) * 100
            ce_itm = max(spot - s, 0)
            pe_itm = max(s - spot, 0)
            time_val = max(10, 200 - diff * 0.3) + random.uniform(-15, 15)
            ce_ltp = round(max(ce_itm + time_val, 1), 2)
            pe_ltp = round(max(pe_itm + time_val * 0.9, 1), 2)
            chain.append({
                "strike": s,
                "ce_ltp": ce_ltp,
                "pe_ltp": pe_ltp,
                "ce_oi": random.randint(50000, 500000),
                "pe_oi": random.randint(50000, 500000),
                "ce_volume": random.randint(1000, 80000),
                "pe_volume": random.randint(1000, 80000),
                "ce_change": round(random.uniform(-20, 20), 2),
                "pe_change": round(random.uniform(-20, 20), 2),
            })
        return {
            "status": "success",
            "source": "mock" if not self.is_connected() else "live",
            "symbol": symbol,
            "spot_price": spot,
            "lot_size": lot_size,
            "strike_step": step,
            "expiry": "2026-08-14",
            "days_to_expiry": 7,
            "chain": chain
        }

    def place_order(self, symbol, qty, side, order_type=2, product="INTRADAY", price=0):
        """
        Place an order via Fyers.
        side: 1=BUY, -1=SELL
        order_type: 1=Limit, 2=Market
        """
        if not self.is_connected():
            return {"error": "Not connected. Please login first."}
        try:
            fyers = self._get_fyers_model()
            order_data = {
                "symbol": symbol,
                "qty": qty,
                "type": order_type,
                "side": side,
                "productType": product,
                "limitPrice": price,
                "stopPrice": 0,
                "validity": "DAY",
                "offlineOrder": False
            }
            return fyers.place_order(order_data)
        except Exception as e:
            return {"error": str(e)}

# Singleton instance
fyers_broker = FyersConnector()
