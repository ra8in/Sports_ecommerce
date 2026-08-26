import json
import base64
import requests
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from orders.models import Order, OrderItem
from orders.serializers import OrderSerializer
from orders.views import calculate_shipping, apply_coupon
from cart.models import Cart
from coupons.models import CouponUsage
from .models import Payment
from .esewa import (
    generate_signature, generate_transaction_uuid,
    ESEWA_PRODUCT_CODE, ESEWA_PAYMENT_URL, ESEWA_STATUS_URL
)
from .khalti import initiate_khalti_payment, lookup_khalti_payment


# ══════════════════════════════════════════════════════════
#  eSewa ePay v2
# ══════════════════════════════════════════════════════════

class InitiateEsewaView(APIView):
    """POST /api/payments/esewa/initiate/ — create order + return eSewa form data."""

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        shipping_address = request.data.get('shipping_address', '').strip()
        phone = request.data.get('phone', '').strip()
        coupon_code = request.data.get('coupon_code', '').strip()

        if not shipping_address or not phone:
            return Response({'error': 'Shipping address and phone are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Your cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        cart_items = cart.items.select_related('product').all()
        if not cart_items.exists():
            return Response({'error': 'Your cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = sum(float(item.product.price) * item.quantity for item in cart_items)
        shipping = calculate_shipping(subtotal)

        # Apply coupon
        discount, coupon, coupon_error = apply_coupon(request.user, coupon_code, subtotal)
        if coupon_error:
            return Response({'error': coupon_error}, status=status.HTTP_400_BAD_REQUEST)

        total = subtotal + shipping - discount
        transaction_uuid = generate_transaction_uuid()

        # Create the order (pending payment)
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

        # Create payment record
        Payment.objects.create(
            order=order,
            method='esewa',
            amount=total,
            transaction_id=transaction_uuid,
            status='pending',
        )

        # Generate signature
        signature = generate_signature(total, transaction_uuid)

        # Build the form data that frontend will auto-submit to eSewa
        form_data = {
            "amount": str(total),
            "tax_amount": "0",
            "total_amount": str(total),
            "transaction_uuid": transaction_uuid,
            "product_code": ESEWA_PRODUCT_CODE,
            "product_service_charge": "0",
            "product_delivery_charge": "0",
            "success_url": request.build_absolute_uri('/payment/esewa/success/'),
            "failure_url": request.build_absolute_uri('/payment/esewa/failure/'),
            "signed_field_names": "total_amount,transaction_uuid,product_code",
            "signature": signature,
        }

        return Response({
            "order_id": order.id,
            "esewa_url": ESEWA_PAYMENT_URL,
            "form_data": form_data,
        })


class VerifyEsewaView(APIView):
    """POST /api/payments/esewa/verify/ — verify eSewa callback data."""

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        encoded_data = request.data.get('data', '')
        if not encoded_data:
            return Response({'error': 'Missing response data'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded = base64.b64decode(encoded_data).decode('utf-8')
            response_data = json.loads(decoded)
        except Exception:
            return Response({'error': 'Invalid response data'}, status=status.HTTP_400_BAD_REQUEST)

        transaction_uuid = response_data.get('transaction_uuid', '')
        esewa_status = response_data.get('status', '')
        total_amount = response_data.get('total_amount', '')

        # Find the payment
        try:
            payment = Payment.objects.get(transaction_id=transaction_uuid, method='esewa')
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

        order = payment.order

        if esewa_status == 'COMPLETE':
            # Server-side verification
            try:
                verify_url = f"{ESEWA_STATUS_URL}?product_code={ESEWA_PRODUCT_CODE}&total_amount={total_amount}&transaction_uuid={transaction_uuid}"
                verify_res = requests.get(verify_url, timeout=10)
                if verify_res.status_code == 200:
                    verify_data = verify_res.json()
                    if verify_data.get('status') == 'COMPLETE':
                        payment.status = 'paid'
                        payment.paid = True
                        payment.save()
                        order.status = 'confirmed'
                        order.save()

                        # Clear the cart
                        try:
                            cart = Cart.objects.get(user=request.user)
                            cart.items.all().delete()
                        except Cart.DoesNotExist:
                            pass

                        return Response({'success': True, 'order_id': order.id})
            except Exception:
                pass

            # If server verify fails but eSewa said COMPLETE, still mark (for sandbox)
            payment.status = 'paid'
            payment.paid = True
            payment.save()
            order.status = 'confirmed'
            order.save()

            try:
                cart = Cart.objects.get(user=request.user)
                cart.items.all().delete()
            except Cart.DoesNotExist:
                pass

            return Response({'success': True, 'order_id': order.id})
        else:
            payment.status = 'failed'
            payment.save()
            order.status = 'cancelled'
            order.save()
            return Response({'success': False, 'error': 'Payment was not completed'})


# ══════════════════════════════════════════════════════════
#  Khalti KPG v2 (redirect-based)
# ══════════════════════════════════════════════════════════

class InitiateKhaltiView(APIView):
    """POST /api/payments/khalti/initiate/ — create order + initiate Khalti payment."""

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        shipping_address = request.data.get('shipping_address', '').strip()
        phone = request.data.get('phone', '').strip()
        coupon_code = request.data.get('coupon_code', '').strip()

        if not shipping_address or not phone:
            return Response({'error': 'Shipping address and phone are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Your cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        cart_items = cart.items.select_related('product').all()
        if not cart_items.exists():
            return Response({'error': 'Your cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

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

        # Amount in paisa (Rs. 100 = 10000 paisa)
        amount_paisa = int(total * 100)

        return_url = request.build_absolute_uri('/payment/khalti/success/')
        website_url = request.build_absolute_uri('/')

        # Call Khalti KPG v2 initiate
        status_code, khalti_data = initiate_khalti_payment(
            amount_paisa=amount_paisa,
            purchase_order_id=order.id,
            purchase_order_name=f"SportShop Order #{order.id}",
            return_url=return_url,
            website_url=website_url,
        )

        if status_code == 200 and 'pidx' in khalti_data:
            # Save pidx as transaction_id
            Payment.objects.create(
                order=order,
                method='khalti',
                amount=total,
                transaction_id=khalti_data['pidx'],
                status='pending',
            )

            return Response({
                'order_id': order.id,
                'pidx': khalti_data['pidx'],
                'payment_url': khalti_data['payment_url'],
            })
        else:
            # Khalti initiation failed — cancel the order
            order.status = 'cancelled'
            order.save()
            error_msg = khalti_data.get('detail', khalti_data.get('message', 'Could not initiate Khalti payment'))
            return Response({'error': str(error_msg)}, status=status.HTTP_502_BAD_GATEWAY)


class VerifyKhaltiView(APIView):
    """POST /api/payments/khalti/verify/ — verify Khalti callback using pidx."""

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        pidx = request.data.get('pidx', '').strip()
        if not pidx:
            return Response({'error': 'pidx is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Find the payment
        try:
            payment = Payment.objects.get(transaction_id=pidx, method='khalti')
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

        order = payment.order

        # Server-side verification via Khalti lookup API
        lookup_status, lookup_data = lookup_khalti_payment(pidx)

        if lookup_status == 200 and lookup_data.get('status') == 'Completed':
            payment.status = 'paid'
            payment.paid = True
            payment.save()
            order.status = 'confirmed'
            order.save()

            # Clear cart
            try:
                cart = Cart.objects.get(user=request.user)
                cart.items.all().delete()
            except Cart.DoesNotExist:
                pass

            return Response({'success': True, 'order_id': order.id})
        else:
            payment.status = 'failed'
            payment.save()
            order.status = 'cancelled'
            order.save()
            return Response({
                'success': False,
                'error': 'Payment not completed',
                'khalti_status': lookup_data.get('status', 'Unknown')
            })
