# backend/backend/settings.py

from pathlib import Path
from datetime import timedelta
import os
import dj_database_url
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

# --- KEY PRODUCTION SETTINGS ---

# SECRET_KEY will be loaded from an environment variable in production
SECRET_KEY = config("SECRET_KEY")

# DEBUG must be False in production
DEBUG = config("DEBUG", default=False, cast=bool)

# Define the allowed hosts for your application
# This is a critical security setting for production.
ALLOWED_HOSTS = [
    'storevisitdjangoproject-backend-demo.onrender.com', # Your live backend URL
    'localhost',
    '127.0.0.1',
]

# Render provides the RENDER_EXTERNAL_HOSTNAME variable, which is your backend's domain name.
# This code block adds it to ALLOWED_HOSTS automatically if it exists.
# This is a robust way to handle it, but we also hardcode it above for safety.
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
    "django.contrib.staticfiles", # Required for WhiteNoise
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_extensions",
]

# --- MIDDLEWARE ---
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # WhiteNoise Middleware should be placed directly after SecurityMiddleware
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware", # CORS Middleware
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# --- CORS SETTINGS ---
# This allows your live frontend to make requests to your live backend
CORS_ALLOWED_ORIGINS = [
    "https://storevisitdjangoproject-front-demo.onrender.com",
]
# For local development, allow React's default port
if DEBUG:
    CORS_ALLOWED_ORIGINS.append("http://localhost:3000")


ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"


# --- DATABASE ---
# Configured to use PostgreSQL on Render and SQLite for local development
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}

# --- PASSWORD VALIDATION (No changes) ---
AUTH_PASSWORD_VALIDATORS = [
    # ... (no changes here)
]

# ... Internationalization (No changes) ...
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# --- STATIC FILES ---
# Settings for Django's static files and WhiteNoise
STATIC_URL = "/static/"
# This is where Django will collect all static files to
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
# Tell Django to look for static files in your apps' 'static' directories
STATICFILES_DIRS = []
# Use WhiteNoise's storage backend for efficient file handling
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ... Default primary key (No changes) ...
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ... DRF and JWT Settings (No changes) ...
REST_FRAMEWORK = {
    # ...
}
SIMPLE_JWT = {
    # ...
}

# --- CUSTOM USER MODEL (No changes) ---
AUTH_USER_MODEL = "accounts.CustomUser"