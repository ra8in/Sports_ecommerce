import hmac
import hashlib
import base64
import uuid

# eSewa Sandbox credentials (college project / testing)
ESEWA_SECRET_KEY = "8gBm/:&EnhH.1/q"
ESEWA_PRODUCT_CODE = "EPAYTEST"
ESEWA_PAYMENT_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
ESEWA_STATUS_URL = "https://uat.esewa.com.np/api/epay/transaction/status/"


def generate_signature(total_amount, transaction_uuid, product_code=ESEWA_PRODUCT_CODE):
    """Generate HMAC-SHA256 signature for eSewa ePay v2."""
    message = f"total_amount={total_amount},transaction_uuid={transaction_uuid},product_code={product_code}"
    hmac_hash = hmac.new(
        ESEWA_SECRET_KEY.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).digest()
    return base64.b64encode(hmac_hash).decode('utf-8')


def generate_transaction_uuid():
    """Generate unique transaction ID."""
    return str(uuid.uuid4())
