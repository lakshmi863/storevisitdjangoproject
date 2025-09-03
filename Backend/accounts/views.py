# accounts/views.py
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response


from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser, Employee
from .serializers import RegisterSerializer, StoreSerializer,EmailTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

# -------------------------------
# Register User
# -------------------------------
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


# -------------------------------
# Login User (JWT)
# -------------------------------
# -------------------------------
# Login User with Email (JWT)
# -------------------------------
class EmailTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = EmailTokenObtainPairSerializer



# -------------------------------
# Employee Allocated Stores
# -------------------------------
class EmployeeStoresView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
            stores = employee.stores.all()
            serializer = StoreSerializer(stores, many=True)
            return Response(serializer.data, status=200)

        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=404)