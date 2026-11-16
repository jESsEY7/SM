from django.urls import path

from .views import ProductDetailView, ProductListCreateView

urlpatterns = [
    path('', ProductListCreateView.as_view(), name='product-list-create'),
    path('<str:lookup>/', ProductDetailView.as_view(), name='product-detail'),
]

