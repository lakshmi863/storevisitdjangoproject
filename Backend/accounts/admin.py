from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import CustomUser, Store, Employee

admin.site.register(CustomUser)
admin.site.register(Store)
admin.site.register(Employee)
