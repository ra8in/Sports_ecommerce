import requests

# ──────────────────────────────────────────────────────────
# Khalti KPG v2 — Sandbox credentials
# Get your own key from: https://test-admin.khalti.com/
# Login OTP for sandbox dashboard: 987654
# ──────────────────────────────────────────────────────────
KHALTI_SECRET_KEY = "8671604dbe82406fb2bb3be6042e7bdd"
KHALTI_BASE_URL = "https://dev.khalti.com/api/v2"
KHALTI_INITIATE_URL = f"{KHALTI_BASE_URL}/epayment/initiate/"
KHALTI_LOOKUP_URL = f"{KHALTI_BASE_URL}/epayment/lookup/"


def initiate_khalti_payment(amount_paisa, purchase_order_id, purchase_order_name, return_url, website_url):
    """
    Initiate a Khalti KPG v2 payment.
    Returns {'pidx': '...', 'payment_url': '...'} on success.
    Amount must be in PAISA (Rs. 100 = 10000 paisa).
    """
    payload = {
        "return_url": return_url,
        "website_url": website_url,
        "amount": amount_paisa,
        "purchase_order_id": str(purchase_order_id),
        "purchase_order_name": purchase_order_name,
    }

    headers = {
        "Authorization": f"Key {KHALTI_SECRET_KEY}",
        "Content-Type": "application/json",
    }

    response = requests.post(KHALTI_INITIATE_URL, json=payload, headers=headers, timeout=15)
    return response.status_code, response.json()


def lookup_khalti_payment(pidx):
    """
    Verify a Khalti payment using pidx.
    Returns the transaction status from Khalti.
    """
    headers = {
        "Authorization": f"Key {KHALTI_SECRET_KEY}",
        "Content-Type": "application/json",
    }

    response = requests.post(KHALTI_LOOKUP_URL, json={"pidx": pidx}, headers=headers, timeout=15)
    return response.status_code, response.json()
