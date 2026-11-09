from django.contrib import admin
from .models import PaymentTransaction


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'order',
        'phone_number',
        'amount',
        'mpesa_receipt_number',
        'status',
        'payment_method',
        'created_at',
    ]
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['mpesa_receipt_number', 'checkout_request_id', 'phone_number', 'order__order_number']
    readonly_fields = ['created_at', 'updated_at']
