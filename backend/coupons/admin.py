from django.contrib import admin
from .models import Coupon, CouponUsage


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_type', 'discount_value', 'min_order_amount', 'max_uses', 'times_used', 'active', 'valid_from', 'valid_until')
    list_filter = ('active', 'discount_type')
    search_fields = ('code',)
    list_editable = ('active',)


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ('coupon', 'user', 'used_at')
    list_filter = ('coupon',)
