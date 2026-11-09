from rest_framework import serializers
from .models import PaymentTransaction
from orders.models import Order
from .services import format_phone_number


class PaymentTransactionSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    customer_name = serializers.CharField(source='order.customer_name', read_only=True)
    email = serializers.CharField(source='order.email', read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            'id',
            'order',
            'order_number',
            'customer_name',
            'email',
            'phone_number',
            'amount',
            'merchant_request_id',
            'checkout_request_id',
            'mpesa_receipt_number',
            'status',
            'payment_method',
            'result_code',
            'result_desc',
            'transaction_date',
            'raw_callback_payload',
            'qr_code_data',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class STKPushInitiateSerializer(serializers.Serializer):
    order_id = serializers.IntegerField(required=False)
    order_number = serializers.CharField(required=False)
    phone_number = serializers.CharField(max_length=20)

    def validate_phone_number(self, value):
        formatted = format_phone_number(value)
        if len(formatted) < 10 or not formatted.startswith('254'):
            raise serializers.ValidationError('Please enter a valid Kenyan phone number (e.g. 0712345678 or 254712345678).')
        return formatted

    def validate(self, attrs):
        order_id = attrs.get('order_id')
        order_number = attrs.get('order_number')

        if not order_id and not order_number:
            raise serializers.ValidationError('Either order_id or order_number must be provided.')

        try:
            if order_id:
                order = Order.objects.get(pk=order_id)
            else:
                order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            raise serializers.ValidationError('Order not found.')

        if order.status in ['cancelled', 'delivered']:
            raise serializers.ValidationError(f'Cannot initiate payment for order in {order.status} state.')

        attrs['order'] = order
        return attrs


class DynamicQRInitiateSerializer(serializers.Serializer):
    order_id = serializers.IntegerField(required=False)
    order_number = serializers.CharField(required=False)

    def validate(self, attrs):
        order_id = attrs.get('order_id')
        order_number = attrs.get('order_number')

        if not order_id and not order_number:
            raise serializers.ValidationError('Either order_id or order_number must be provided.')

        try:
            if order_id:
                order = Order.objects.get(pk=order_id)
            else:
                order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            raise serializers.ValidationError('Order not found.')

        attrs['order'] = order
        return attrs

