from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin,Group, Permission
from django.conf import settings
from django import forms
from djongo import models
from rest_framework import serializers
from django.dispatch import receiver
from django.db.models.signals import post_save
from rest_framework.authtoken.models import Token
import os
from io import BytesIO
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from datetime import date
from django.db.models.signals import pre_save
import datetime
from django.core.files import File
from reportlab.pdfgen import canvas
from django.utils.text import slugify
from django.core.files.storage import default_storage
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)



class MedcineManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)

class Medcine(AbstractBaseUser, PermissionsMixin):
    _id = models.ObjectIdField(primary_key=True)
    name = models.CharField(max_length=100)
    photo = models.ImageField(upload_to=default_storage.location, blank=True,null=True)
    phone_number = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True)
    occupation = models.CharField(max_length=100, blank=True,default=None)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_connected = models.BooleanField(default=False)
    manager = models.ForeignKey('self', on_delete=models.CASCADE, related_name='medicines',null=True, blank=True,default=None)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'phone_number']

    objects = MedcineManager()



    verbose_name = "Medcine"
    verbose_name_plural = "Medicines"
    
class Patient(models.Model):
    photo = models.ImageField(upload_to=default_storage.location, blank=True)
    _id = models.ObjectIdField(primary_key=True)
    name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    
    age = models.IntegerField()
    email = models.EmailField(max_length=100, unique=True)
    date_added = models.DateField(auto_now=True)  # Date of addition (automatically set to the current date)
    medicine = models.ForeignKey(Medcine, on_delete=models.CASCADE,blank=True) # Use ReferenceField for the foreign key-like relationship
    # Add your custom methods or override methods here
    # ...

def patient_image_path(instance, filename):
    # Set the directory path for storing the uploaded scan file
        
        return os.path.join(default_storage.location,f'{instance._id}/{filename}')
class analyses(models.Model):
    _id = models.SlugField(max_length=50, primary_key=True, unique=True, editable=False)
    date = models.DateField(auto_now_add=True)
    result = models.CharField(max_length=50, blank=True)
    center = models.TextField(blank=True)  # Using JSONField to store multiple center values
    diameter = models.TextField(blank=True)
    image = models.TextField(blank=True)
    scan = models.FileField(upload_to=patient_image_path,max_length=500)
    nodule = models.TextField(blank=True)  # Using JSONField to store multiple nodule values
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)

    def __str__(self):
        return str(self._id)

    def save(self, *args, **kwargs):
        # Generate a unique ID based on the patient ID and the current date
        patient_id = self.patient_id
        current_date = date.today()

        # Generate a unique ID based on the patient ID and the current date
        self._id = f"{slugify(str(patient_id))}-{current_date}"

        super().save(*args, **kwargs)
# models.py
from django.utils import timezone

class Subscription(models.Model):
    _id = models.ObjectIdField(primary_key=True)
    medcine = models.ForeignKey(Medcine, on_delete=models.CASCADE)
    start_date = models.DateTimeField(auto_now_add=True)
    is_subscribe = models.BooleanField(default=False)
    end_date = models.DateTimeField()
    
@receiver(pre_save, sender=Subscription)
def update_is_subscribe(sender, instance, **kwargs):
    current_datetime = timezone.now()

    # Ensure that end_date is a datetime object with timezone information
    if isinstance(instance.end_date, str):
        end_date = timezone.datetime.strptime(instance.end_date, "%Y-%m-%dT%H:%M:%S.%fZ")
        end_date = timezone.make_aware(instance.end_date, timezone=instance.end_date.tzinfo)

    # Check if end_date is not None and is in the past
        if end_date < current_datetime:
            instance.is_subscribe = False

# Register the signal
pre_save.connect(update_is_subscribe, sender=Subscription)



        # Add your custom methods or override methods here
class Notification(models.Model):
    _id = models.ObjectIdField(primary_key=True)
    sender = models.ForeignKey(Medcine, on_delete=models.CASCADE, related_name='sent_notifications')
    receiver = models.ForeignKey(Medcine, on_delete=models.CASCADE, related_name='received_notifications')
    message = models.TextField()  # A field for the notification message
    notification_type = models.CharField(max_length=100)  # New field for notification type (e.g., 'collaboration_accepted')

    # You can also add other fields or methods as needed

    def __str__(self):
        return f"{self.sender} to {self.receiver}: {self.notification_type}"
class Message(models.Model):
    sender = models.ForeignKey(Medcine, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(Medcine, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
   
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"From {self.sender.username} to {self.recipient.username}"
class Treatement(models.Model):
    _id = models.ObjectIdField(primary_key=True)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    create_date = models.DateField(auto_now_add=True)
    patient = models.ForeignKey(Patient,on_delete=models.CASCADE)
def patient_report_path(instance, filename):
    # Set the directory path for storing the uploaded scan file
        
        return os.path.join(default_storage.location,f'{instance.analyse_id}/{filename}')

class Report(models.Model):
    _id = models.ObjectIdField(primary_key=True)
    analyse = models.OneToOneField(analyses, on_delete=models.CASCADE)
    pdf_report = models.FileField(upload_to=patient_report_path, null=True, blank=True)
 