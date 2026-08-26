from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('percent', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]

    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE_CHOICES, default='percent')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, help_text='Percentage (e.g. 10 for 10%) or fixed amount in Rs.')
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text='Minimum subtotal required to use this coupon')
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text='Max discount cap for percent coupons (0 = no cap)')
    max_uses = models.PositiveIntegerField(default=0, help_text='0 = unlimited')
    times_used = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.discount_type == 'percent':
            return f"{self.code} — {self.discount_value}% off"
        return f"{self.code} — Rs. {self.discount_value} off"

    def is_valid(self, subtotal=0):
        """Check if the coupon can be used right now for the given subtotal."""
        if not self.active:
            return False, 'This coupon is no longer active.'
        now = timezone.now()
        if now < self.valid_from:
            return False, 'This coupon is not yet valid.'
        if self.valid_until and now > self.valid_until:
            return False, 'This coupon has expired.'
        if self.max_uses > 0 and self.times_used >= self.max_uses:
            return False, 'This coupon has reached its usage limit.'
        if subtotal < float(self.min_order_amount):
            return False, f'Minimum order of Rs. {int(self.min_order_amount)} required.'
        return True, ''

    def calculate_discount(self, subtotal):
        """Return the discount amount for a given subtotal."""
        if self.discount_type == 'percent':
            discount = subtotal * (float(self.discount_value) / 100)
            if self.max_discount > 0:
                discount = min(discount, float(self.max_discount))
        else:
            discount = float(self.discount_value)
        # Never discount more than the subtotal
        return min(discount, subtotal)


class CouponUsage(models.Model):
    """Tracks per-user coupon usage to prevent re-use."""
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coupon_usages')
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('coupon', 'user')

    def __str__(self):
        return f"{self.user.username} used {self.coupon.code}"
