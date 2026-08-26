from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from products.models import Product
from products.serializers import ProductSerializer
from .models import WishlistItem


class WishlistView(APIView):
    """GET /api/wishlist/ — return the user's wishlist product IDs + details."""

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        items = WishlistItem.objects.filter(user=request.user).select_related('product')
        products = [item.product for item in items]
        serializer = ProductSerializer(products, many=True, context={'request': request})
        product_ids = list(items.values_list('product_id', flat=True))
        return Response({
            'product_ids': product_ids,
            'products': serializer.data,
        })


class WishlistToggleView(APIView):
    """POST /api/wishlist/toggle/ — add or remove a product from wishlist."""

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        item, created = WishlistItem.objects.get_or_create(user=request.user, product=product)
        if not created:
            item.delete()
            return Response({'status': 'removed', 'product_id': product.id})
        return Response({'status': 'added', 'product_id': product.id}, status=status.HTTP_201_CREATED)


class WishlistIdsView(APIView):
    """GET /api/wishlist/ids/ — lightweight: just return list of wishlisted product IDs."""

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'product_ids': []})

        ids = list(WishlistItem.objects.filter(user=request.user).values_list('product_id', flat=True))
        return Response({'product_ids': ids})
