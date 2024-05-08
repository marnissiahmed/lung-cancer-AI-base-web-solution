import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from lungdiagnostic.routing import websocket_urlpatterns

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "application.settings")
django.setup()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": URLRouter(websocket_urlpatterns)
    
})