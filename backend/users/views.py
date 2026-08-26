from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.middleware.csrf import get_token
from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            get_token(request)  # Force CSRF token creation so the frontend can read it
            return Response(UserSerializer(user).data)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully'})


class ProfileView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            get_token(request)  # Force CSRF token creation
            return Response(UserSerializer(request.user).data)
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        
    def put(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
            
        user = request.user
        
        # Check for unique email/username conflicts before updating
        username = request.data.get('username')
        email = request.data.get('email')
        
        if username and User.objects.exclude(pk=user.pk).filter(username=username).exists():
            return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)
        if email and User.objects.exclude(pk=user.pk).filter(email=email).exists():
            return Response({'error': 'Email already connected to another account'}, status=status.HTTP_400_BAD_REQUEST)

        # Update textual fields
        if 'first_name' in request.data: user.first_name = request.data['first_name']
        if 'last_name' in request.data: user.last_name = request.data['last_name']
        if username: user.username = username
        if email: user.email = email
        
        if hasattr(user, 'profile'):
            if 'phone' in request.data: user.profile.phone = request.data['phone']
            if 'address' in request.data: user.profile.address = request.data['address']
            user.profile.save()
        
        # Handle password update
        password = request.data.get('password')
        old_password = request.data.get('old_password')
        
        if password:
            if not old_password:
                return Response({'error': 'Old password is required to set a new password.'}, status=status.HTTP_400_BAD_REQUEST)
            if not user.check_password(old_password):
                return Response({'error': 'Incorrect old password.'}, status=status.HTTP_400_BAD_REQUEST)
            if len(password) < 8:
                return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(password)

        user.save()
        
        # If password was changed, we need to relogin to preserve session
        if password:
            login(request, user)
            
        return Response(UserSerializer(user).data)


class PasswordResetRequestView(APIView):
    """Send a password-reset link (prints to console in dev)."""

    def post(self, request):
        email = request.data.get('email', '').strip()
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Always return success to avoid user-enumeration attacks
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'message': 'If that email exists, a reset link has been sent.'})

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"/reset-password/{uid}/{token}"

        # In dev the console backend just prints the email
        send_mail(
            subject='SportShop – Password Reset',
            message=f'Click the link below to reset your password:\n\n{reset_url}\n',
            from_email='noreply@sportshop.local',
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response({'message': 'If that email exists, a reset link has been sent.'})


class PasswordResetConfirmView(APIView):
    """Validate uid+token and set a new password."""

    def post(self, request):
        uid = request.data.get('uid', '')
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')

        if not all([uid, token, new_password]):
            return Response(
                {'error': 'uid, token, and new_password are all required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'error': 'Invalid reset link.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {'error': 'Reset link has expired or is invalid.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password has been reset successfully.'})
