from django.urls import path
from .views import RegisterView, EmailTokenObtainPairView, EmployeeStoresView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("employee/stores/", EmployeeStoresView.as_view(), name="employee_stores"),
]
