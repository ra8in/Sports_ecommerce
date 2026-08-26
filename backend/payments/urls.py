from django.urls import path
from . import views

urlpatterns = [
    # eSewa
    path('esewa/initiate/', views.InitiateEsewaView.as_view(), name='esewa-initiate'),
    path('esewa/verify/', views.VerifyEsewaView.as_view(), name='esewa-verify'),
    # Khalti KPG v2
    path('khalti/initiate/', views.InitiateKhaltiView.as_view(), name='khalti-initiate'),
    path('khalti/verify/', views.VerifyKhaltiView.as_view(), name='khalti-verify'),
]
