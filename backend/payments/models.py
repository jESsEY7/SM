from django.db import models
from orders.models import Order


class PaymentTransaction(models.Model):
    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('timeout', 'Timed Out'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('stk_push', 'M-Pesa STK Push'),
        ('qr_code', 'M-Pesa Dynamic QR'),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    phone_number = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    merchant_request_id = models.CharField(max_length=100, blank=True, db_index=True)
    checkout_request_id = models.CharField(max_length=100, blank=True, null=True, unique=True, db_index=True)
    mpesa_receipt_number = models.CharField(max_length=100, blank=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated', db_index=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='stk_push')
    result_code = models.IntegerField(null=True, blank=True)
    result_desc = models.TextField(blank=True)
    transaction_date = models.DateTimeField(null=True, blank=True)
    raw_callback_payload = models.JSONField(default=dict, blank=True)
    qr_code_data = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.mpesa_receipt_number or self.checkout_request_id or self.id} ({self.status}) - KES {self.amount}'
