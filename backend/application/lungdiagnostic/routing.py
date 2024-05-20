from django.urls import path,re_path

from channels.security.websocket import AllowedHostsOriginValidator, OriginValidator

from lungdiagnostic import consumers  # Importing notification Consumer from consumers.py
websocket_urlpatterns = [
    re_path(r'ws/notification/(?P<room_name>\w+)/$', consumers.NotificationConsumer.as_asgi()),
    re_path(r'ws/message/(?P<room_name>\w+)/$',consumers.messageConsumer.as_asgi()),

]
