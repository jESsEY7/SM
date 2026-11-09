from django.db.models import Sum
from rest_framework.generics import ListCreateAPIView, UpdateAPIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order
from .serializers import OrderSerializer, OrderStatusSerializer


class OrderListCreateView(ListCreateAPIView):
    """
    GET  /api/orders/  — Admin only: list all orders (latest first, limit 200)
    POST /api/orders/  — Public: place a new order
    """

    serializer_class = OrderSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        qs = Order.objects.all().order_by('-created_at')
        status_param = self.request.query_params.get('status')
        if status_param and status_param != 'all':
            qs = qs.filter(status=status_param)
        return qs[:200]


class OrderStatusUpdateView(UpdateAPIView):
    """PATCH /api/orders/<pk>/status/ — Admin only: update order status."""

    serializer_class = OrderStatusSerializer
    permission_classes = [IsAdminUser]
    queryset = Order.objects.all()
    http_method_names = ['patch', 'head', 'options']


class DashboardAnalyticsView(APIView):
    """
    GET /api/orders/analytics/
    Admin only: aggregated store metrics and analytics.
    """
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        orders = Order.objects.all()
        total_orders = orders.count()
        revenue = orders.filter(status__in=['confirmed', 'shipped', 'delivered']).aggregate(s=Sum('total'))['s'] or 0
        pending_val = orders.filter(status='pending').aggregate(s=Sum('total'))['s'] or 0
        cancelled = orders.filter(status='cancelled').count()

        from payments.models import PaymentTransaction
        total_transactions = PaymentTransaction.objects.count()
        paid_transactions = PaymentTransaction.objects.filter(status='completed').count()
        mpesa_collected = PaymentTransaction.objects.filter(status='completed').aggregate(s=Sum('amount'))['s'] or 0

        from accounts.models import User
        total_users = User.objects.count()

        return Response({
            'total_orders': total_orders,
            'revenue': float(revenue),
            'pending_value': float(pending_val),
            'cancelled_orders': cancelled,
            'total_transactions': total_transactions,
            'paid_transactions': paid_transactions,
            'mpesa_collected': float(mpesa_collected),
            'total_users': total_users,
        })
