import razorpay, os
import requests
import time


razorpay_client = razorpay.Client(
    auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET"))
)


_rate_cache = {"rate": None, "timestamp": 0}
CACHE_TTL = 3600 * 2  # 2 hours

def get_usd_to_inr_rate_cached():
    now = time.time()
    if _rate_cache["rate"] is None or now - _rate_cache["timestamp"] > CACHE_TTL:
        url = "https://api.exchangerate-api.com/v4/latest/USD"
        resp = requests.get(url)
        data = resp.json()
        _rate_cache["rate"] = data["rates"]["INR"]
        _rate_cache["timestamp"] = now
    return _rate_cache["rate"]

def usd_to_inr_paise(amount_usd: float) -> int:
    """
    Convert USD amount to INR paise (smallest currency unit).
    """
    rate = get_usd_to_inr_rate_cached()  # e.g. 83.15
    inr_amount = amount_usd * rate
    paise = int(round(inr_amount * 100))
    return paise

print(usd_to_inr_paise(1))