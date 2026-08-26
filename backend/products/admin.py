from django.contrib import admin
from .models import Category, Product, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'priority')
    list_editable = ('priority',)
    prepopulated_fields = {'slug': ('name',)}


from django.db import models
from django.forms.widgets import URLInput

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0
    fields = ('image', 'image_url', 'order')

    class Media:
        js = ('admin/js/image_toggle.js',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'description')
    inlines = [ProductImageInline]
