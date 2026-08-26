from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price', 'line_total']

    def get_line_total(self, obj):
        return float(obj.price) * obj.quantity

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'status', 'total_price', 'shipping_charge', 'discount', 'coupon_code', 'shipping_address', 'phone', 'items', 'total_items', 'created_at']

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())
