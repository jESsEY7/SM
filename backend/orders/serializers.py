import random

from rest_framework import serializers

from .models import Order


def _generate_order_number():
    """Generate a unique order number in the format LB-XXXXXX."""
    while True:
        number = f'LB-{random.randint(100000, 999999)}'
        if not Order.objects.filter(order_number=number).exists():
            return number


class OrderSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

    def create(self, validated_data):
        validated_data['order_number'] = _generate_order_number()
        return super().create(validated_data)


class OrderStatusSerializer(serializers.ModelSerializer):
    """Serializer for updating only the status field of an order."""

    class Meta:
        model = Order
        fields = ['status']

