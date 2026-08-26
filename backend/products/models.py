import os
from django.db import models
from django.utils.text import slugify


def product_image_path(instance, filename):
    """Save images under products/<product-name>/<product-name>_<n>.<ext>"""
    name_slug = slugify(instance.product.name) or 'product'
    ext = os.path.splitext(filename)[1]
    # Count existing images to auto-number
    count = instance.product.images.count() + 1
    return f'products/{name_slug}/{name_slug}_{count}{ext}'

def category_image_path(instance, filename):
    name_slug = slugify(instance.name) or 'category'
    ext = os.path.splitext(filename)[1]
    return f'categories/{name_slug}{ext}'

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    priority = models.IntegerField(default=0, help_text="Lower numbers appear first. e.g. 1 is first, 2 is second.")
    image = models.ImageField(upload_to=category_image_path, blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)

    class Meta:
        ordering = ['priority', 'name']
        verbose_name_plural = 'Categories'

    def clean(self):
        super().clean()
        if self.image and self.image_url:
            self.image_url = ''

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base = ''
            if self.category:
                base = slugify(self.category.name) + '-'
            base += slugify(self.name)
            slug = base
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


from django.core.exceptions import ValidationError

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to=product_image_path, blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def clean(self):
        super().clean()
        if self.image and self.image_url:
            # If they accidentally provide both, just keep the uploaded file and quietly erase the URL
            self.image_url = ''
            
        if not self.image and not self.image_url:
            raise ValidationError("You must provide either an uploaded image or an image link.")

    def __str__(self):
        return f'{self.product.name} – image {self.order}'
