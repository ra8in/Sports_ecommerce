from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrderListView.as_view(), name='order-list'),
    path('place/', views.PlaceOrderView.as_view(), name='order-place'),
    path('<int:order_id>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('<int:order_id>/cancel/', views.OrderCancelView.as_view(), name='order-cancel'),
]
