from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver


# -------------------
# Custom User Manager
# -------------------
class CustomUserManager(BaseUserManager):
    def create_user(self, email, name, password=None, role="employee", **extra_fields):
        if not email:
            raise ValueError("The Email field is required")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault("role", "admin")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, name, password, **extra_fields)


# -------------------
# Custom User Model
# -------------------
class CustomUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("employee", "Employee"),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="employee")

    # Required for Django admin
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def __str__(self):
        return f"{self.name} ({self.role})"


# -------------------
# Store Model
# -------------------
class Store(models.Model):
    store_id = models.AutoField(primary_key=True)
    store_information = models.CharField(max_length=255)
    location = models.CharField(max_length=100, default="Hyderabad")
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Store {self.store_id} - {self.store_information}"


# -------------------
# Employee Model
# -------------------
class Employee(models.Model):
    emp_id = models.AutoField(primary_key=True)
    emp_name = models.CharField(max_length=100)

    # Link each employee to a CustomUser
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="employee_profile",
        null=True, blank=True
    )

    # Many-to-Many relation: One employee can work at many stores
    stores = models.ManyToManyField(Store, related_name="employees")

    def __str__(self):
        return f"{self.emp_name} (ID: {self.emp_id})"


# -------------------
# Signals
# -------------------
@receiver(post_save, sender=CustomUser)
def create_employee_profile(sender, instance, created, **kwargs):
    """
    Auto-create Employee profile when a new user with role 'employee' is created.
    """
    if created and instance.role == "employee":
        Employee.objects.create(user=instance, emp_name=instance.name)
