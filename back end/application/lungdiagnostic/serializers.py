from django.contrib.auth import get_user_model,authenticate
from rest_framework import serializers
from .models import Patient,analyses,Subscription,Notification,Report,Treatement,MedcineManager
from django.core.files.storage import default_storage
from django.forms import ClearableFileInput
from django import forms
from bson import ObjectId
import os
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from rest_framework import serializers

# serializers.py
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import serializers

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = (
    "medcine" ,
    'start_date',
    'is_subscribe' ,
    "end_date")
    def to_internal_value(self, data):
        # Create a mutable copy of the data
        mutable_data = data.copy()

        # Convert the 'medicine' field value from string to ObjectId if present
        if 'medicine' in mutable_data:
            try:
                # If your 'medicine' field is of ObjectId type, you may skip this conversion.
                mutable_data['medcine'] = ObjectId(mutable_data['medcine'])
            except:
                raise serializers.ValidationError("Invalid medicine ID")
    
    def create(self, validated_data):
        return super().create(validated_data)
class MedcineSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ('_id','email','phone_number','password','name',"occupation",'is_superuser','manager','is_active','is_connected','photo')
        extra_kwargs = {
            'password': { 'write_only':True,'min_length': 4},
            '_id': {'read_only': True},  
        }
    def update(self, instance, validated_data):
        # Make password field optional during updates
        instance.email = validated_data.get('email', instance.email)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.name = validated_data.get('name', instance.name)
        instance.occupation = validated_data.get('occupation', instance.occupation)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.photo = validated_data.get('photo', instance.photo)
        # Update password if provided
        password = validated_data.get('password')
        if password:
            instance.set_password(password)

        instance.save()
        return instance
    def create(self, validated_data):
        # Hash the password before saving
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
    def to_internal_value(self, data):
            mutable_data = data.copy()
            if 'manager' in mutable_data:
            
                if mutable_data['manager']=='false':
                    mutable_data['manager'] = None
                else:
                    try:
                        
                        # If your 'medicine' field is of ObjectId type, you may skip this conversion.
                        mutable_data['manager'] = ObjectId(mutable_data['manager'])
                        
                    except:
                        raise serializers.ValidationError("Invalid medicine ID")
                  # Convert the 'medicine' field value from string to ObjectId if present
            
                   
            return super().to_internal_value(mutable_data)

    def to_representation(self, instance):
        # Convert the 'id' field from ObjectId to a string
        representation = super().to_representation(instance)
        representation['_id'] = str(representation['_id'])
        representation['manager'] = str(representation['manager'])
        return representation
    
       

class AuthTokenSeialaizer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = authenticate(
                request=self.context.get('request'),
                email=email,
                password=password
            )

            attrs['user'] = user

        except ValidationError as e:
            raise serializers.ValidationError(e.message)

        return attrs
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
    def to_representation(self, instance):
        # Convert the 'id' field from ObjectId to a string
        representation = super().to_representation(instance)
        representation['_id'] = str(representation['_id'])
        representation['sender'] = str(representation['sender'])
        representation['receiver'] = str(representation['receiver'])
        return representation

    def to_representation(self, instance):
        # Convert the 'id' field from ObjectId to a string
        representation = super().to_representation(instance)
        representation['_id'] = str(representation['_id'])
        representation['medicine']=str(representation['medicine'])
        return representation

def patient_image_path(instance, filename):
    # Set the directory path for storing the uploaded scan file
        return os.path.join('patient_scans', f'{instance}/{filename}')
class AnalysisSerialize(serializers.ModelSerializer):
    class Meta:
        model= analyses
        
        fields = ('_id','date','scan','nodule', 'result', 'center', 'diameter', 'image', 'patient')
        
    


    def to_representation(self, instance):
        # Convert the 'id' field from ObjectId to a string
        representation = super().to_representation(instance)
        representation['patient'] = str(representation['patient'])
        return representation
    def create(self, validated_data):
            return super().create(validated_data)

class PtientSerialze(serializers.ModelSerializer):
    
    class Meta:
        model = Patient
        fields = ('_id', 'name', 'last_name', 'location', 'age', 'email', 'date_added', 'medicine', 'photo')
 
    def to_internal_value(self, data):
        # Create a mutable copy of the data
        mutable_data = data.copy()

        # Convert the 'medicine' field value from string to ObjectId if present
        if 'medicine' in mutable_data:
            try:
                # If your 'medicine' field is of ObjectId type, you may skip this conversion.
                mutable_data['medicine'] = ObjectId(mutable_data['medicine'])
            except:
                raise serializers.ValidationError("Invalid medicine ID")
        return super().to_internal_value(mutable_data)
    def update(self, instance, validated_data):
        # Update the fields of the instance with the validated data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        image_file = self.context['request'].FILES.get('mhdFile', None)
        if image_file:
            instance.images.delete()  # Delete the old image file (if exists)
            instance.images.save(image_file.name, image_file)  # Save the new image file
        # Save the updated instance
        instance.save()
        return instance
    def to_representation(self, instance):
        # Convert the 'id' field from ObjectId to a string
        representation = super().to_representation(instance)
        representation['medicine'] = str(representation['medicine'])
        return representation
    
    
class treatementSerialize(serializers.ModelSerializer):
    class Meta:
        model = Treatement
        fields=( "_id","description","start_date","end_date","create_date","patient")
    def to_internal_value(self, data):
        # Create a mutable copy of the data
        mutable_data = data.copy()

        # Convert the 'medicine' field value from string to ObjectId if present
        if 'patient' in mutable_data:
            try:
                # If your 'medicine' field is of ObjectId type, you may skip this conversion.
                mutable_data['patient'] = ObjectId(mutable_data['patient'])
            except:
                raise serializers.ValidationError("Invalid medicine ID")
        
        return super().to_internal_value(mutable_data)
    def to_representation(self, instance):
        # Convert the 'id' field from ObjectId to a string
        representation = super().to_representation(instance)
        representation['patient'] = PtientSerialze(instance.patient).data
        return representation

class ReportSerialze(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'
