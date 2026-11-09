from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from .models import Product
from .serializers import ProductSerializer


class ProductListView(ListAPIView):
    """Return all active products ordered by sort_order."""

    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Product.objects.filter(active=True).order_by('sort_order', 'name')


class ProductDetailView(RetrieveAPIView):
    """Return a single product by slug."""

    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    queryset = Product.objects.filter(active=True)
    lookup_field = 'slug'

