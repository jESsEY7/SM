from django.urls import path

from .views import DashboardAnalyticsView, OrderListCreateView, OrderStatusUpdateView

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='order-list-create'),
    path('analytics/', DashboardAnalyticsView.as_view(), name='dashboard-analytics'),
    path('<int:pk>/status/', OrderStatusUpdateView.as_view(), name='order-status-update'),
]
