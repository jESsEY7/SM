import datetime
import logging
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView

from orders.models import Order
from .models import PaymentTransaction
from .serializers import (
    DynamicQRInitiateSerializer,
    PaymentTransactionSerializer,
    STKPushInitiateSerializer,
)
from .services import DarajaMpesaClient

logger = logging.getLogger(__name__)


def _parse_callback_metadata(items):
    data = {}
    for item in items:
        name = item.get('Name')
        val = item.get('Value')
        if name:
            data[name] = val
    return data


def _process_mpesa_callback_data(callback_data):
    """
    Idempotent helper to parse and apply M-Pesa STK push callback results.
    """
    merchant_id = callback_data.get('MerchantRequestID')
    checkout_id = callback_data.get('CheckoutRequestID')
    result_code = callback_data.get('ResultCode')
    result_desc = callback_data.get('ResultDesc', '')
    metadata_items = callback_data.get('CallbackMetadata', {}).get('Item', [])

    parsed_meta = _parse_callback_metadata(metadata_items)

    transaction = None
    if checkout_id:
        transaction = PaymentTransaction.objects.filter(checkout_request_id=checkout_id).first()
    if not transaction and merchant_id:
        transaction = PaymentTransaction.objects.filter(merchant_request_id=merchant_id).first()

    if not transaction:
        logger.warning(f'No PaymentTransaction found for CheckoutRequestID {checkout_id}')
        return None

    # Idempotency check: if already completed, do not re-process
    if transaction.status == 'completed':
        logger.info(f'Transaction {transaction.id} already marked completed. Skipping re-processing.')
        return transaction

    transaction.raw_callback_payload = callback_data
    transaction.result_code = result_code
    transaction.result_desc = result_desc

    if result_code == 0:
        transaction.status = 'completed'
        transaction.mpesa_receipt_number = parsed_meta.get('MpesaReceiptNumber', '')
        raw_date = str(parsed_meta.get('TransactionDate', ''))
        if len(raw_date) == 14:
            try:
                dt = datetime.datetime.strptime(raw_date, '%Y%m%d%H%M%S')
                transaction.transaction_date = timezone.make_aware(dt, timezone=datetime.timezone.utc)
            except Exception:
                transaction.transaction_date = timezone.now()
        else:
            transaction.transaction_date = timezone.now()

        # Update order status to confirmed
        order = transaction.order
        order.status = 'confirmed'
        order.save(update_fields=['status', 'updated_at'])
    elif result_code in [1032, 1037]:  # 1032: Cancelled by user, 1037: Timeout
        transaction.status = 'cancelled' if result_code == 1032 else 'timeout'
    else:
        transaction.status = 'failed'

    transaction.save()
    return transaction


class STKPushInitiateView(APIView):
    """
    POST /api/payments/mpesa/stkpush/
    Initiate Daraja STK Push to customer's phone.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = STKPushInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = serializer.validated_data['order']
        phone_number = serializer.validated_data['phone_number']

        client = DarajaMpesaClient()
        response = client.initiate_stk_push(
            phone_number=phone_number,
            amount=float(order.total),
            account_reference=order.order_number,
            transaction_desc=f'Order {order.order_number}'
        )

        if not response.get('success'):
            return Response({
                'detail': response.get('error', 'Failed to initiate STK Push with M-Pesa gateway.'),
            }, status=status.HTTP_400_BAD_REQUEST)

        checkout_id = response.get('CheckoutRequestID')
        merchant_id = response.get('MerchantRequestID')

        transaction = PaymentTransaction.objects.create(
            order=order,
            phone_number=phone_number,
            amount=order.total,
            merchant_request_id=merchant_id or '',
            checkout_request_id=checkout_id,
            status='pending',
            payment_method='stk_push',
            result_desc=response.get('CustomerMessage', 'STK Push sent'),
        )

        return Response({
            'transaction_id': transaction.id,
            'checkout_request_id': checkout_id,
            'status': 'pending',
            'amount': float(order.total),
            'order_number': order.order_number,
            'customer_message': response.get('CustomerMessage', 'Please check your phone and enter your M-Pesa PIN.'),
            'simulated': response.get('simulated', False),
        }, status=status.HTTP_200_OK)


class MPesaCallbackView(APIView):
    """
    POST /api/payments/mpesa/callback/
    Public webhook endpoint receiving Safaricom Daraja STK Push callback.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        payload = request.data
        logger.info(f'Received M-Pesa callback: {payload}')

        stk_callback = payload.get('Body', {}).get('stkCallback', {})
        if not stk_callback:
            return Response({'ResultCode': 1, 'ResultDesc': 'Invalid callback payload'}, status=status.HTTP_400_BAD_REQUEST)

        _process_mpesa_callback_data(stk_callback)

        return Response({'ResultCode': 0, 'ResultDesc': 'Callback accepted successfully'}, status=status.HTTP_200_OK)


class TransactionStatusQueryView(APIView):
    """
    GET /api/payments/mpesa/status/<checkout_request_id>/
    Poll or verify payment transaction status.
    """
    permission_classes = [AllowAny]

    def get(self, request, checkout_request_id, *args, **kwargs):
        transaction = PaymentTransaction.objects.filter(checkout_request_id=checkout_request_id).first()
        if not transaction:
            return Response({'detail': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)

        # If pending for > 35 seconds, query Daraja STK status
        now = datetime.datetime.now(datetime.timezone.utc)
        elapsed = (now - transaction.created_at).total_seconds()
        if transaction.status == 'pending' and elapsed > 35:
            client = DarajaMpesaClient()
            query_res = client.query_stk_status(checkout_request_id)
            if query_res.get('success'):
                res_code = query_res.get('ResultCode')
                if res_code == '0':
                    transaction.status = 'completed'
                    transaction.result_code = 0
                    transaction.order.status = 'confirmed'
                    transaction.order.save(update_fields=['status', 'updated_at'])
                    transaction.save()
                elif res_code in ['1032', '1037']:
                    transaction.status = 'cancelled' if res_code == '1032' else 'timeout'
                    transaction.result_code = int(res_code)
                    transaction.save()

        return Response({
            'transaction_id': transaction.id,
            'checkout_request_id': transaction.checkout_request_id,
            'status': transaction.status,
            'mpesa_receipt_number': transaction.mpesa_receipt_number,
            'amount': float(transaction.amount),
            'order_id': transaction.order_id,
            'order_number': transaction.order.order_number,
            'order_status': transaction.order.status,
            'result_desc': transaction.result_desc,
            'transaction_date': transaction.transaction_date,
        }, status=status.HTTP_200_OK)


class DynamicQRGenerateView(APIView):
    """
    POST /api/payments/mpesa/qr/
    Generate dynamic M-Pesa QR code for an order.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = DynamicQRInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.validated_data['order']

        client = DarajaMpesaClient()
        qr_result = client.generate_dynamic_qr(
            account_reference=order.order_number,
            amount=float(order.total),
        )

        transaction = PaymentTransaction.objects.create(
            order=order,
            phone_number='',
            amount=order.total,
            status='pending',
            payment_method='qr_code',
            qr_code_data=qr_result.get('qr_code', ''),
            result_desc='Dynamic QR generated for scan-to-pay',
        )

        return Response({
            'transaction_id': transaction.id,
            'qr_code': qr_result.get('qr_code'),
            'shortcode': qr_result.get('shortcode'),
            'amount': float(order.total),
            'order_number': order.order_number,
            'status': 'pending',
            'simulated': qr_result.get('simulated', False),
        }, status=status.HTTP_200_OK)


class SimulateCallbackView(APIView):
    """
    POST /api/payments/mpesa/simulate-callback/
    Sandbox/Development tool to simulate an incoming M-Pesa callback.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        checkout_id = request.data.get('checkout_request_id')
        scenario = request.data.get('scenario', 'success')  # success, cancelled, failed, timeout

        transaction = PaymentTransaction.objects.filter(checkout_request_id=checkout_id).first()
        if not transaction:
            return Response({'detail': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

        if scenario == 'success':
            receipt = f'NLJ{datetime.datetime.now().strftime("%H%M%S")}'
            simulated_payload = {
                'MerchantRequestID': transaction.merchant_request_id or 'SIM-MERCH-1',
                'CheckoutRequestID': checkout_id,
                'ResultCode': 0,
                'ResultDesc': 'The service request is processed successfully.',
                'CallbackMetadata': {
                    'Item': [
                        {'Name': 'Amount', 'Value': float(transaction.amount)},
                        {'Name': 'MpesaReceiptNumber', 'Value': receipt},
                        {'Name': 'TransactionDate', 'Value': datetime.datetime.now().strftime('%Y%m%d%H%M%S')},
                        {'Name': 'PhoneNumber', 'Value': transaction.phone_number or '254712345678'},
                    ]
                }
            }
        elif scenario == 'cancelled':
            simulated_payload = {
                'MerchantRequestID': transaction.merchant_request_id or 'SIM-MERCH-1',
                'CheckoutRequestID': checkout_id,
                'ResultCode': 1032,
                'ResultDesc': 'Request cancelled by user',
            }
        elif scenario == 'timeout':
            simulated_payload = {
                'MerchantRequestID': transaction.merchant_request_id or 'SIM-MERCH-1',
                'CheckoutRequestID': checkout_id,
                'ResultCode': 1037,
                'ResultDesc': 'DS timeout user cannot be reached',
            }
        else:
            simulated_payload = {
                'MerchantRequestID': transaction.merchant_request_id or 'SIM-MERCH-1',
                'CheckoutRequestID': checkout_id,
                'ResultCode': 1,
                'ResultDesc': 'The balance is insufficient for the transaction.',
            }

        updated = _process_mpesa_callback_data(simulated_payload)
        return Response({
            'detail': f'Simulated {scenario} callback processed.',
            'status': updated.status if updated else 'unknown',
            'mpesa_receipt_number': updated.mpesa_receipt_number if updated else None,
            'order_status': updated.order.status if updated else None,
        }, status=status.HTTP_200_OK)


class TransactionListView(ListAPIView):
    """
    GET /api/payments/transactions/
    Admin only: list all payment transactions.
    """
    permission_classes = [IsAdminUser]
    serializer_class = PaymentTransactionSerializer

    def get_queryset(self):
        qs = PaymentTransaction.objects.select_related('order').all()
        status_param = self.request.query_params.get('status')
        if status_param and status_param != 'all':
            qs = qs.filter(status=status_param)
        return qs[:200]


class TransactionDetailView(RetrieveAPIView):
    """
    GET /api/payments/transactions/<pk>/
    Admin only: view detailed transaction record.
    """
    permission_classes = [IsAdminUser]
    serializer_class = PaymentTransactionSerializer
    queryset = PaymentTransaction.objects.select_related('order').all()
