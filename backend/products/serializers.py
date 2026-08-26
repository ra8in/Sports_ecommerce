from rest_framework import serializers
from .models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    resolved_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'priority', 'resolved_image_url')

    def get_resolved_image_url(self, obj):
        if obj.image_url:
            return obj.image_url
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ('id', 'url', 'order')

    def get_url(self, obj):
        if obj.image_url:
            return obj.image_url
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    image_url = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def get_image_url(self, obj):
        """Return the first image's URL as the main product image."""
        first = obj.images.first()
        if first:
            if first.image_url:
                return first.image_url
            if first.image:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(first.image.url)
                return first.image.url
        return None
