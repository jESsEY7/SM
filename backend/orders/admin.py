from django.contrib import admin

from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer_name', 'email', 'status', 'total', 'created_at']
    list_filter = ['status']
    search_fields = ['order_number', 'customer_name', 'email']
    list_editable = ['status']
    ordering = ['-created_at']
    readonly_fields = ['order_number', 'created_at', 'updated_at']

