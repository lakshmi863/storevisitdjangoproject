from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser, Store, Employee
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = CustomUser
        fields = ["id", "name", "email", "password", "role"]

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            name=validated_data["name"],
            password=validated_data["password"],
            role=validated_data.get("role", "employee"),
        )
        return user

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"   # 👈 This tells JWT to use email instead of username

    def validate(self, attrs):
        # Extract email + password
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Email and password are required.")

        # Authenticate user
        user = authenticate(request=self.context.get("request"),
                            email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        # Call the parent class validate to get tokens
        data = super().validate(attrs)

        # Add custom user info if you want
        data.update({
            "user_id": user.id,
            "name": user.name,
            "role": user.role,
            "email": user.email,
        })

        return data

# -------------------------
# New: Store Serializer
# -------------------------
class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = ["store_id", "store_information", "latitude", "longitude"]


# -------------------------
# New: Employee Serializer (optional, if needed)
# -------------------------
class EmployeeSerializer(serializers.ModelSerializer):
    stores = StoreSerializer(many=True, read_only=True)

    class Meta:
        model = Employee
        fields = ["emp_id", "emp_name", "stores"]
