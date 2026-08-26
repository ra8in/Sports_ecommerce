from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Coupon


class ValidateCouponView(APIView):
    """POST /api/coupons/validate/ — validate a coupon code and return discount info."""

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        code = request.data.get('code', '').strip().upper()
        subtotal = float(request.data.get('subtotal', 0))

        if not code:
            return Response({'error': 'Coupon code is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid coupon code.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if user already used this coupon
        if coupon.usages.filter(user=request.user).exists():
            return Response({'error': 'You have already used this coupon.'}, status=status.HTTP_400_BAD_REQUEST)

        valid, message = coupon.is_valid(subtotal)
        if not valid:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

        discount = coupon.calculate_discount(subtotal)

        return Response({
            'code': coupon.code,
            'discount_type': coupon.discount_type,
            'discount_value': float(coupon.discount_value),
            'discount_amount': round(discount, 2),
            'message': f'Coupon applied! You save Rs. {int(discount)}',
        })
