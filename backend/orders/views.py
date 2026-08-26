from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order, OrderItem
from .serializers import OrderSerializer
from cart.models import Cart
from coupons.models import Coupon, CouponUsage


SHIPPING_THRESHOLD = 5000
SHIPPING_CHARGE = 200


def calculate_shipping(subtotal):
    """Rs. 200 for orders under Rs. 5000, free otherwise."""
    return 0 if subtotal >= SHIPPING_THRESHOLD else SHIPPING_CHARGE


def apply_coupon(user, code, subtotal):
    """Validate and calculate coupon discount. Returns (discount, coupon, error)."""
    if not code:
        return 0, None, None

    code = code.strip().upper()
    try:
        coupon = Coupon.objects.get(code=code)
    except Coupon.DoesNotExist:
        return 0, None, 'Invalid coupon code.'

    if coupon.usages.filter(user=user).exists():
        return 0, None, 'You have already used this coupon.'

    valid, message = coupon.is_valid(subtotal)
    if not valid:
        return 0, None, message

    discount = coupon.calculate_discount(subtotal)
    return discount, coupon, None


class OrderListView(APIView):
    """GET /api/orders/ — list all orders for the authenticated user."""

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        return Response(OrderSerializer(orders, many=True).data)


class PlaceOrderView(APIView):
    """POST /api/orders/place/ — create an order from the user's cart (COD)."""

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        shipping_address = request.data.get('shipping_address', '').strip()
        phone = request.data.get('phone', '').strip()
        payment_method = request.data.get('payment_method', 'cod')
        coupon_code = request.data.get('coupon_code', '').strip()

        if not shipping_address:
            return Response({'error': 'Shipping address is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not phone:
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Get the user's cart
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Your cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        cart_items = cart.items.select_related('product').all()
        if not cart_items.exists():
            return Response({'error': 'Your cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate totals
        subtotal = sum(float(item.product.price) * item.quantity for item in cart_items)
        shipping = calculate_shipping(subtotal)

        # Apply coupon
        discount, coupon, coupon_error = apply_coupon(request.user, coupon_code, subtotal)
        if coupon_error:
            return Response({'error': coupon_error}, status=status.HTTP_400_BAD_REQUEST)

        total = subtotal + shipping - discount

        # Create the order
        order = Order.objects.create(
            user=request.user,
            total_price=total,
            shipping_charge=shipping,
            discount=discount,
            coupon_code=coupon.code if coupon else '',
            shipping_address=shipping_address,
            phone=phone,
            status='pending',
        )

        # Create order items from cart items
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price,
            )

        # Record coupon usage
        if coupon:
            CouponUsage.objects.create(coupon=coupon, user=request.user)
            coupon.times_used += 1
            coupon.save()

        # Clear the cart after placing the order
        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    """GET /api/orders/<order_id>/ — get details of a specific order."""

    def get(self, request, order_id):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            order = Order.objects.get(pk=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(OrderSerializer(order).data)


class OrderCancelView(APIView):
    """POST /api/orders/<order_id>/cancel/ — cancel a pending order."""

    def post(self, request, order_id):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            order = Order.objects.get(pk=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if order.status != 'pending':
            return Response({'error': 'Only pending orders can be cancelled'}, status=status.HTTP_400_BAD_REQUEST)
            
        order.status = 'cancelled'
        order.save()
        
        return Response({'message': 'Order cancelled successfully', 'status': order.status})
