from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from products.models import Product
from .models import Cart, CartItem
from .serializers import CartSerializer


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


class CartDetailView(APIView):
    """GET /api/cart/ — return the authenticated user's cart."""

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        cart = get_or_create_cart(request.user)
        return Response(CartSerializer(cart).data)


class CartAddView(APIView):
    """POST /api/cart/add/ — add a product (or increment qty)."""

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        cart = get_or_create_cart(request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity
        item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartUpdateView(APIView):
    """PUT /api/cart/update/<item_id>/ — set quantity of a cart item."""

    def put(self, request, item_id):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        quantity = int(request.data.get('quantity', 1))
        cart = get_or_create_cart(request.user)

        try:
            item = cart.items.get(pk=item_id)
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)

        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()

        return Response(CartSerializer(cart).data)


class CartRemoveView(APIView):
    """DELETE /api/cart/remove/<item_id>/ — remove a specific item."""

    def delete(self, request, item_id):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        cart = get_or_create_cart(request.user)

        try:
            item = cart.items.get(pk=item_id)
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)

        item.delete()
        return Response(CartSerializer(cart).data)


class CartClearView(APIView):
    """POST /api/cart/clear/ — remove all items from cart."""

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        cart = get_or_create_cart(request.user)
        cart.items.all().delete()
        return Response(CartSerializer(cart).data)
