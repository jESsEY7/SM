from django.urls import path
from .views import (
    DynamicQRGenerateView,
    MPesaCallbackView,
    STKPushInitiateView,
    SimulateCallbackView,
    TransactionDetailView,
    TransactionListView,
    TransactionStatusQueryView,
)

urlpatterns = [
    path('mpesa/stkpush/', STKPushInitiateView.as_view(), name='mpesa-stkpush'),
    path('mpesa/callback/', MPesaCallbackView.as_view(), name='mpesa-callback'),
    path('mpesa/status/<str:checkout_request_id>/', TransactionStatusQueryView.as_view(), name='mpesa-status'),
    path('mpesa/qr/', DynamicQRGenerateView.as_view(), name='mpesa-qr'),
    path('mpesa/simulate-callback/', SimulateCallbackView.as_view(), name='mpesa-simulate-callback'),
    path('transactions/', TransactionListView.as_view(), name='payments-transactions'),
    path('transactions/<int:pk>/', TransactionDetailView.as_view(), name='payments-transaction-detail'),
]

