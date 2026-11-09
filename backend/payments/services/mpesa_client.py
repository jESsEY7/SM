import base64
from datetime import datetime, timedelta
import logging
import re
import requests
from decouple import config

logger = logging.getLogger(__name__)


def format_phone_number(phone: str) -> str:
    """Format Kenyan phone number to 254XXXXXXXXX standard format."""
    digits = re.sub(r'\D', '', str(phone or ''))
    if digits.startswith('0'):
        digits = '254' + digits[1:]
    elif digits.startswith('7') or digits.startswith('1'):
        digits = '254' + digits
    elif digits.startswith('254'):
        pass
    return digits


class DarajaMpesaClient:
    """
    Safaricom Daraja API client with token caching, STK push,
    transaction status query, and dynamic QR code generation.
    """

    def __init__(self):
        self.env = config('MPESA_ENVIRONMENT', default='sandbox').lower()
        self.consumer_key = config('MPESA_CONSUMER_KEY', default='sandbox_consumer_key')
        self.consumer_secret = config('MPESA_CONSUMER_SECRET', default='sandbox_consumer_secret')
        self.shortcode = config('MPESA_SHORTCODE', default='174379')
        self.passkey = config(
            'MPESA_PASSKEY',
            default='bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
        )
        self.callback_url = config(
            'MPESA_CALLBACK_URL',
            default='http://127.0.0.1:8000/api/payments/mpesa/callback/'
        )
        self.simulate = config('MPESA_SIMULATE', default=True, cast=bool)

        if self.env == 'production':
            self.base_url = 'https://api.safaricom.co.ke'
        else:
            self.base_url = 'https://sandbox.safaricom.co.ke'

        self._cached_token = None
        self._token_expiry = None

    def get_access_token(self) -> str:
        """Fetch or return cached OAuth access token."""
        now = datetime.utcnow()
        if self._cached_token and self._token_expiry and now < self._token_expiry:
            return self._cached_token

        if self.simulate and (self.consumer_key == 'sandbox_consumer_key' or not self.consumer_key):
            self._cached_token = 'simulated_mpesa_access_token'
            self._token_expiry = now + timedelta(minutes=50)
            return self._cached_token

        url = f'{self.base_url}/oauth/v1/generate?grant_type=client_credentials'
        try:
            auth_str = f'{self.consumer_key}:{self.consumer_secret}'
            encoded_auth = base64.b64encode(auth_str.encode('utf-8')).decode('utf-8')
            headers = {'Authorization': f'Basic {encoded_auth}'}
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                self._cached_token = data['access_token']
                expires_in = int(data.get('expires_in', 3599))
                self._token_expiry = now + timedelta(seconds=expires_in - 60)
                return self._cached_token
            else:
                logger.error(f'Daraja OAuth failed: {resp.status_code} {resp.text}')
                if self.simulate:
                    self._cached_token = 'simulated_mpesa_access_token'
                    self._token_expiry = now + timedelta(minutes=50)
                    return self._cached_token
                raise Exception(f'Daraja OAuth authorization failed: {resp.text}')
        except Exception as e:
            logger.exception('Daraja OAuth error')
            if self.simulate:
                self._cached_token = 'simulated_mpesa_access_token'
                self._token_expiry = now + timedelta(minutes=50)
                return self._cached_token
            raise e

    def _generate_password(self, timestamp: str) -> str:
        data = f'{self.shortcode}{self.passkey}{timestamp}'
        return base64.b64encode(data.encode('utf-8')).decode('utf-8')

    def initiate_stk_push(self, phone_number: str, amount: float, account_reference: str, transaction_desc: str = 'Sylvia Aesthetics Purchase') -> dict:
        """
        Initiate Daraja STK Push (Lipa Na M-Pesa Online).
        """
        formatted_phone = format_phone_number(phone_number)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = self._generate_password(timestamp)

        # In simulation mode with placeholder keys, return realistic mock response
        if self.simulate and (self.consumer_key == 'sandbox_consumer_key' or not self.consumer_key):
            import random
            checkout_id = f'ws_CO_{datetime.now().strftime("%d%m%Y%H%M%S")}_{random.randint(1000, 9999)}'
            merchant_id = f'{random.randint(10000, 99999)}-{random.randint(10000000, 99999999)}-1'
            return {
                'success': True,
                'MerchantRequestID': merchant_id,
                'CheckoutRequestID': checkout_id,
                'ResponseCode': '0',
                'ResponseDescription': 'Success. Request accepted for processing',
                'CustomerMessage': 'Success. Request accepted for processing',
                'simulated': True,
            }

        token = self.get_access_token()
        url = f'{self.base_url}/mpesa/stkpush/v1/processrequest'
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
        }

        payload = {
            'BusinessShortCode': self.shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': int(round(amount)),
            'PartyA': formatted_phone,
            'PartyB': self.shortcode,
            'PhoneNumber': formatted_phone,
            'CallBackURL': self.callback_url,
            'AccountReference': account_reference[:12],
            'TransactionDesc': transaction_desc[:13],
        }

        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=15)
            data = resp.json()
            if resp.status_code == 200 and data.get('ResponseCode') == '0':
                return {
                    'success': True,
                    'MerchantRequestID': data.get('MerchantRequestID'),
                    'CheckoutRequestID': data.get('CheckoutRequestID'),
                    'ResponseCode': data.get('ResponseCode'),
                    'ResponseDescription': data.get('ResponseDescription'),
                    'CustomerMessage': data.get('CustomerMessage'),
                    'simulated': False,
                }
            else:
                logger.warning(f'STK Push failed: {data}')
                return {
                    'success': False,
                    'error': data.get('errorMessage') or data.get('CustomerMessage') or 'STK push rejected by gateway',
                    'raw': data,
                }
        except Exception as e:
            logger.exception('STK Push network exception')
            if self.simulate:
                import random
                checkout_id = f'ws_CO_{datetime.now().strftime("%d%m%Y%H%M%S")}_{random.randint(1000, 9999)}'
                merchant_id = f'{random.randint(10000, 99999)}-{random.randint(10000000, 99999999)}-1'
                return {
                    'success': True,
                    'MerchantRequestID': merchant_id,
                    'CheckoutRequestID': checkout_id,
                    'ResponseCode': '0',
                    'ResponseDescription': 'Success. Request accepted for processing (simulated fallback)',
                    'CustomerMessage': 'Success. Request accepted for processing',
                    'simulated': True,
                }
            return {'success': False, 'error': str(e)}

    def query_stk_status(self, checkout_request_id: str) -> dict:
        """
        Query STK Push status via Daraja stkpushquery endpoint.
        """
        if self.simulate and (self.consumer_key == 'sandbox_consumer_key' or not self.consumer_key):
            return {
                'success': True,
                'ResponseCode': '0',
                'ResultCode': '0',
                'ResultDesc': 'The service request is processed successfully.',
                'simulated': True,
            }

        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = self._generate_password(timestamp)
        token = self.get_access_token()
        url = f'{self.base_url}/mpesa/stkpushquery/v1/query'
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
        }
        payload = {
            'BusinessShortCode': self.shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'CheckoutRequestID': checkout_request_id,
        }

        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=12)
            data = resp.json()
            return {
                'success': resp.status_code == 200,
                'raw': data,
                'ResultCode': data.get('ResultCode'),
                'ResultDesc': data.get('ResultDesc'),
            }
        except Exception as e:
            logger.exception('STK status query error')
            return {'success': False, 'error': str(e)}

    def generate_dynamic_qr(self, account_reference: str, amount: float, trx_code: str = 'PB') -> dict:
        """
        Generate dynamic M-Pesa QR code via Daraja API or standard M-Pesa compliant dynamic payload.
        """
        if self.simulate and (self.consumer_key == 'sandbox_consumer_key' or not self.consumer_key):
            # Generate valid M-Pesa dynamic QR payload formatted string
            qr_content = f'BG:{self.shortcode}?AM={int(round(amount))}&NR={account_reference}&OM=SYLVIA'
            return {
                'success': True,
                'qr_code': qr_content,
                'shortcode': self.shortcode,
                'amount': int(round(amount)),
                'reference': account_reference,
                'simulated': True,
            }

        token = self.get_access_token()
        url = f'{self.base_url}/mpesa/qrcode/v1/generate'
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
        }
        payload = {
            'MerchantName': 'Sylvia Aesthetics',
            'RefNo': account_reference,
            'Amount': int(round(amount)),
            'TrxCode': trx_code,
            'CPI': self.shortcode,
            'Size': '300',
        }
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=12)
            data = resp.json()
            if resp.status_code == 200 and data.get('QRCode'):
                return {
                    'success': True,
                    'qr_code': data.get('QRCode'),
                    'shortcode': self.shortcode,
                    'amount': int(round(amount)),
                    'reference': account_reference,
                    'simulated': False,
                }
            else:
                qr_content = f'BG:{self.shortcode}?AM={int(round(amount))}&NR={account_reference}&OM=LUMEN'
                return {
                    'success': True,
                    'qr_code': qr_content,
                    'shortcode': self.shortcode,
                    'amount': int(round(amount)),
                    'reference': account_reference,
                    'simulated': True,
                }
        except Exception as e:
            logger.exception('QR generate error')
            qr_content = f'BG:{self.shortcode}?AM={int(round(amount))}&NR={account_reference}&OM=LUMEN'
            return {
                'success': True,
                'qr_code': qr_content,
                'shortcode': self.shortcode,
                'amount': int(round(amount)),
                'reference': account_reference,
                'simulated': True,
            }

