import json
import bson
import redis
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from lungdiagnostic.models import Medcine,Notification
from channels.generic.websocket import AsyncWebsocketConsumer
def add_pending_message(user_id, message):
    redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)
    message_json = json.dumps(message)
    redis_client.rpush(f"pending_messages:{user_id}", message_json)
class NotificationConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
            
           
            self.room_name = self.scope['url_route']['kwargs']['room_name']
            self.room_group_name = 'notification_%s' % self.room_name

            # Join room group
            await self.channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name
                )
            # Retrieve the Medcine instance asynchronously
            medcine_instance = await sync_to_async(Medcine.objects.get)(_id=bson.ObjectId( self.room_name))

            # Update the 'is_connected' attribute for the Medcine instance
            medcine_instance.is_connected = True
            await sync_to_async(medcine_instance.save)()
            print(self.channel_name)
            await self.accept()

            # Send all notifications
            await self.send_all_notifications()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        medcine_instance = await sync_to_async(Medcine.objects.get)(_id=bson.ObjectId( self.room_name))

            # Update the 'is_connected' attribute for the Medcine instance
        medcine_instance.is_connected = False
        await sync_to_async(medcine_instance.save)()
    # Receive message from WebSocket
    # async def receive(self, text_data):
    #     text_data_json = json.loads(text_data)
    #     message = text_data_json['message']

    #     # Send message to room group
    #     await self.channel_layer.group_send(
    #         self.room_group_name,
    #         {
    #             'type': 'chat_message',
    #             'message': message
    #         }
    #     )

    # Receive message from room group
    async def send_notification(self, event):
        try:
            print(event['message'])
            massage = {
                'message':event['message'],
                 'notification_type':event['notification_type']
            }
            await self.send(text_data=json.dumps(massage))
        except json.JSONDecodeError as e:
    # Log the error and the contents of the message for debugging
            print(f"JSONDecodeError: {e}")
            print(f"Received message: {event['text']}")
            print(self.channel_name)
    async def send_all_notifications(self):
     # Retrieve all notifications related to the room_name from the database
        try:
                notifications = await sync_to_async(Notification.objects.filter)(receiver=bson.ObjectId(self.room_name))
        # Process the 'notifications' if it exists
        except Notification.DoesNotExist:
        # Handle the case where no matching record was found (empty result)
            notifications = []  # or handle it in any other way you prefer
        async for notification in notifications:
            # Format the notification as needed
            message = {
                'message': notification.message,
                'notification_type': notification.notification_type,
                # Include any other fields you need
            }

            # Send the notification to the connected WebSocket client
            await self.send(json.dumps(message))
        await database_sync_to_async(Notification.objects.filter(receiver=bson.ObjectId(self.room_name)).delete)()
class messageConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
            self.room_name = self.scope['url_route']['kwargs']['room_name']
            self.room_group_name = 'message_%s' % self.room_name

            # Join room group
            await self.channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name
                )
            # Retrieve the Medcine instance asynchronously
           
            await self.accept()


    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
       
    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        _id = text_data_json['_id']
        room_group_name = 'message_%s' % _id
        print(message)
        # Send message to room group
        await self.channel_layer.group_send(
           room_group_name,
            {
                 'type': 'send_message',
                 'message': message["message"], 
                 'message_type':'receive'
            }
        )
        await self.channel_layer.group_send(
           self.room_group_name,
            {
                 'type': 'send_message',
                 'message': message["message"], 
                 'message_type':'send'
            }
        )

    # Receive message from room group
    async def send_message(self, event):
        try:
            message ={
                "message":event["message"],
                "message_type":event["message_type"]
            }
            await self.send(text_data=json.dumps(message))
        except json.JSONDecodeError as e:
    # Log the error and the contents of the message for debugging
            print(f"JSONDecodeError: {e}")
            print(f"Received message: {event['text']}")
            print(self.channel_name)
 