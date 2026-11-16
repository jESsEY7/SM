from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from .models import Product
from .serializers import ProductSerializer


class ProductListCreateView(ListCreateAPIView):
    """
    GET: Return all active products (or all products if admin with ?all=true).
    POST: Admin only: create a new product.
    """

    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        show_all = self.request.query_params.get('all') == 'true'
        if show_all and self.request.user and self.request.user.is_staff:
            return Product.objects.all().order_by('sort_order', 'name')
        return Product.objects.filter(active=True).order_by('sort_order', 'name')

    def perform_create(self, serializer):
        slug = serializer.validated_data.get('slug')
        if not slug:
            name = serializer.validated_data.get('name', 'product')
            shade = serializer.validated_data.get('shade_name', '')
            base_slug = slugify(f'{name}-{shade}' if shade else name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            serializer.save(slug=slug)
        else:
            serializer.save()


class ProductDetailView(RetrieveUpdateDestroyAPIView):
    """
    GET: Return a single product by ID or slug.
    PUT/PATCH: Admin only: update a product.
    DELETE: Admin only: delete a product.
    """

    serializer_class = ProductSerializer
    queryset = Product.objects.all()

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [AllowAny()]

    def get_object(self):
        lookup = self.kwargs.get('lookup')
        queryset = self.filter_queryset(self.get_queryset())
        if lookup.isdigit():
            obj = get_object_or_404(queryset, pk=int(lookup))
        else:
            obj = get_object_or_404(queryset, slug=lookup)
        self.check_object_permissions(self.request, obj)
        return obj

