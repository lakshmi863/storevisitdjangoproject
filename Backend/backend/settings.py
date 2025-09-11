# backend/backend/settings.py

from pathlib import Path
from datetime import timedelta
import os
import dj_database_url
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

# --- KEY PRODUCTION SETTINGS ---

SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", default=False, cast=bool)

ALLOWED_HOSTS = [
    'storevisitdjangoproject-backend-demo.onrender.com',
    'localhost',
    '127.0.0.1',
]
if RENDER_EXTERNAL_HOSTNAME := os.environ.get('RENDER_EXTERNAL_HOSTNAME'):
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# --- INSTALLED APPS (No changes) ---
INSTALLED_APPS = [
    "accounts.apps.AccountsConfig",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_extensions",
]

# --- MIDDLEWARE ---
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# --- CORS & CSRF CONFIGURATION (CRITICAL CHANGES) ---

# This list explicitly tells your backend which frontend domains are allowed to connect.
CORS_ALLOWED_ORIGINS = [
    "https://storevisitdjangoproject-front-demo.onrender.com",
]
# This line is required to allow cookies and authorization headers to be sent across domains.
CORS_ALLOW_CREDENTIALS = True  # <-- ADD THIS LINE

# For local development, this will allow your React server (localhost:3000) to connect.
if DEBUG:
    CORS_ALLOWED_ORIGINS.append("http://localhost:3000")

# This explicitly tells Django to trust your frontend for secure (POST/PUT/PATCH) requests.
CSRF_TRUSTED_ORIGINS = [
    "https://storevisitdjangoproject-front-demo.onrender.com",
] # <-- ADD THIS ENTIRE BLOCK

# --- END OF CRITICAL CHANGES ---

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    # ... (no changes here) ...
]

WSGI_APPLICATION = "backend.wsgi.application"

# --- DATABASE ---
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}

# --- PASSWORD VALIDATION (No changes) ---
AUTH_PASSWORD_VALIDATORS = [
    # ... (no changes here) ...
]

# ... Internationalization (No changes) ...
LANGUAGE_CODE = "en-us"
# ...

# --- STATIC FILES ---
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- DRF AND JWT SETTINGS (CRITICAL CHANGES) ---
REST_FRAMEWORK = {
    # We add SessionAuthentication here to help with CSRF handling across domains.
    "DEFAULT_AUTHENTICATION_CLASSES": (
        'rest_framework.authentication.SessionAuthentication', # <-- ADD THIS LINE
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    # ... (rest is unchanged)
}
# --- END OF CRITICAL CHANGES ---

AUTH_USER_MODEL = "accounts.CustomUser"