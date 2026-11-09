from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from orders.models import Order
from payments.models import PaymentTransaction

User = get_user_model()


class IntegrationTestSuite(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create admin user
        self.admin_user = User.objects.create_superuser(
            email='admin@lumenbeauty.com',
            password='AdminPassword123!',
            first_name='Admin',
            last_name='User',
        )

        # Create regular customer user
        self.customer_user = User.objects.create_user(
            email='customer@lumenbeauty.com',
            password='CustomerPassword123!',
            first_name='Jane',
            last_name='Doe',
        )

        # Create sample test order
        self.order = Order.objects.create(
            order_number='LB-999001',
            customer_name='Jane Doe',
            email='customer@lumenbeauty.com',
            address_line1='Kenyatta Ave, Suite 4',
            city='Nairobi',
            postal_code='00100',
            country='Kenya',
            items=[{'product_id': 1, 'name': 'Orbital Silk', 'price': 38.0, 'quantity': 1}],
            subtotal=Decimal('38.00'),
            shipping=Decimal('6.00'),
            total=Decimal('44.00'),
            status='pending',
        )

    # 1. Frontend connection & public product catalog
    def test_01_public_product_catalog(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # 2. Login and authentication
    def test_02_login_and_auth(self):
        # Invalid login
        res_fail = self.client.post('/api/auth/login/', {'email': 'admin@lumenbeauty.com', 'password': 'wrong'})
        self.assertEqual(res_fail.status_code, status.HTTP_400_BAD_REQUEST)

        # Valid login
        res_ok = self.client.post('/api/auth/login/', {'email': 'admin@lumenbeauty.com', 'password': 'AdminPassword123!'})
        self.assertEqual(res_ok.status_code, status.HTTP_200_OK)
        token = res_ok.data['access']

        # Access /api/auth/me/ with token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res_me = self.client.get('/api/auth/me/')
        self.assertEqual(res_me.status_code, status.HTTP_200_OK)
        self.assertEqual(res_me.data['email'], 'admin@lumenbeauty.com')
        self.assertTrue(res_me.data['is_staff'])

    # 3. Role-based permissions
    def test_03_role_based_permissions(self):
        # Anonymous cannot access admin orders
        res_anon = self.client.get('/api/orders/')
        self.assertEqual(res_anon.status_code, status.HTTP_401_UNAUTHORIZED)

        # Regular customer cannot access admin orders
        login_cust = self.client.post('/api/auth/login/', {'email': 'customer@lumenbeauty.com', 'password': 'CustomerPassword123!'})
        cust_token = login_cust.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {cust_token}')

        res_cust = self.client.get('/api/orders/')
        self.assertEqual(res_cust.status_code, status.HTTP_403_FORBIDDEN)

        # Admin CAN access
        login_admin = self.client.post('/api/auth/login/', {'email': 'admin@lumenbeauty.com', 'password': 'AdminPassword123!'})
        admin_token = login_admin.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')

        res_admin = self.client.get('/api/orders/')
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)

    # 4. Dashboard analytics retrieval
    def test_04_dashboard_analytics_retrieval(self):
        login_admin = self.client.post('/api/auth/login/', {'email': 'admin@lumenbeauty.com', 'password': 'AdminPassword123!'})
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login_admin.data["access"]}')

        res = self.client.get('/api/orders/analytics/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('total_orders', res.data)
        self.assertIn('revenue', res.data)
        self.assertIn('mpesa_collected', res.data)

    # 5. Back Office CRUD operations (Order status update)
    def test_05_backoffice_crud(self):
        login_admin = self.client.post('/api/auth/login/', {'email': 'admin@lumenbeauty.com', 'password': 'AdminPassword123!'})
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login_admin.data["access"]}')

        res = self.client.patch(f'/api/orders/{self.order.id}/status/', {'status': 'shipped'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'shipped')

    # 6. M-Pesa STK Push initiation
    def test_06_mpesa_stk_initiation(self):
        self.client.credentials()  # public
        res = self.client.post('/api/payments/mpesa/stkpush/', {
            'order_id': self.order.id,
            'phone_number': '0712345678',
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('checkout_request_id', res.data)
        self.assertEqual(res.data['status'], 'pending')

        # Verify DB record
        tx = PaymentTransaction.objects.get(checkout_request_id=res.data['checkout_request_id'])
        self.assertEqual(tx.order_id, self.order.id)
        self.assertEqual(tx.status, 'pending')
        self.assertEqual(tx.phone_number, '254712345678')

    # 7. Successful payment callback handling & order confirmation
    def test_07_payment_callback_success(self):
        # Create pending transaction
        tx = PaymentTransaction.objects.create(
            order=self.order,
            phone_number='254712345678',
            amount=self.order.total,
            checkout_request_id='ws_TEST_REQ_SUCCESS_001',
            merchant_request_id='MERCH_001',
            status='pending',
        )

        callback_payload = {
            'Body': {
                'stkCallback': {
                    'MerchantRequestID': 'MERCH_001',
                    'CheckoutRequestID': 'ws_TEST_REQ_SUCCESS_001',
                    'ResultCode': 0,
                    'ResultDesc': 'The service request is processed successfully.',
                    'CallbackMetadata': {
                        'Item': [
                            {'Name': 'Amount', 'Value': 44.0},
                            {'Name': 'MpesaReceiptNumber', 'Value': 'NLJ9988776'},
                            {'Name': 'TransactionDate', 'Value': 20261109123000},
                            {'Name': 'PhoneNumber', 'Value': 254712345678},
                        ]
                    }
                }
            }
        }

        res = self.client.post('/api/payments/mpesa/callback/', callback_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        tx.refresh_from_db()
        self.assertEqual(tx.status, 'completed')
        self.assertEqual(tx.mpesa_receipt_number, 'NLJ9988776')
        self.assertEqual(tx.result_code, 0)

        # Check order status changed to confirmed
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'confirmed')

    # 8. Duplicate callback handling (Idempotency)
    def test_08_duplicate_callback_idempotency(self):
        tx = PaymentTransaction.objects.create(
            order=self.order,
            phone_number='254712345678',
            amount=self.order.total,
            checkout_request_id='ws_TEST_REQ_DUP_001',
            merchant_request_id='MERCH_DUP',
            status='completed',
            mpesa_receipt_number='NLJ_ORIGINAL',
        )

        # Send duplicate callback
        dup_payload = {
            'Body': {
                'stkCallback': {
                    'MerchantRequestID': 'MERCH_DUP',
                    'CheckoutRequestID': 'ws_TEST_REQ_DUP_001',
                    'ResultCode': 0,
                    'ResultDesc': 'Duplicate processing test',
                    'CallbackMetadata': {
                        'Item': [{'Name': 'MpesaReceiptNumber', 'Value': 'NLJ_DUPLICATE'}]
                    }
                }
            }
        }
        res = self.client.post('/api/payments/mpesa/callback/', dup_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        tx.refresh_from_db()
        # Original receipt is preserved, duplicate was rejected idempotently
        self.assertEqual(tx.mpesa_receipt_number, 'NLJ_ORIGINAL')

    # 9. Failed/Cancelled payment callback handling
    def test_09_cancelled_payment_callback(self):
        tx = PaymentTransaction.objects.create(
            order=self.order,
            phone_number='254712345678',
            amount=self.order.total,
            checkout_request_id='ws_TEST_REQ_CANCEL_001',
            status='pending',
        )

        cancel_payload = {
            'Body': {
                'stkCallback': {
                    'MerchantRequestID': 'MERCH_CANCEL',
                    'CheckoutRequestID': 'ws_TEST_REQ_CANCEL_001',
                    'ResultCode': 1032,
                    'ResultDesc': 'Request cancelled by user',
                }
            }
        }
        res = self.client.post('/api/payments/mpesa/callback/', cancel_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        tx.refresh_from_db()
        self.assertEqual(tx.status, 'cancelled')
        self.assertEqual(tx.result_code, 1032)

    # 10. Dynamic QR generation
    def test_10_dynamic_qr_generation(self):
        res = self.client.post('/api/payments/mpesa/qr/', {'order_id': self.order.id})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('qr_code', res.data)
        self.assertIn('174379', res.data['qr_code'])

    # 11. Transaction status query endpoint
    def test_11_transaction_status_query(self):
        tx = PaymentTransaction.objects.create(
            order=self.order,
            phone_number='254712345678',
            amount=self.order.total,
            checkout_request_id='ws_TEST_REQ_QUERY_001',
            status='completed',
            mpesa_receipt_number='NLJ_QUERY_123',
        )

        res = self.client.get(f'/api/payments/mpesa/status/{tx.checkout_request_id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], 'completed')
        self.assertEqual(res.data['mpesa_receipt_number'], 'NLJ_QUERY_123')
