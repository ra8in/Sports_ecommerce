from django.contrib import admin
from django.urls import path, include, re_path
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/products/', include('products.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/coupons/', include('coupons.urls')),
    path('api/wishlist/', include('wishlist.urls')),

    # Serve React build assets (JS/CSS bundles)
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': settings.REACT_BUILD_DIR / 'assets'}),

    # All other routes → React SPA (index.html handles client-side routing)
    re_path(r'^(?!admin|api|media/).*$', TemplateView.as_view(template_name='index.html')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
