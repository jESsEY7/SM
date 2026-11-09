from django.contrib import admin

from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'undertone', 'price', 'active', 'sort_order']
    list_filter = ['category', 'undertone', 'active']
    list_editable = ['sort_order', 'active']
    search_fields = ['name', 'shade_name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['sort_order', 'name']

