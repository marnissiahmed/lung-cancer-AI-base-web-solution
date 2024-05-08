from django.shortcuts import render
from django.core.files.storage import default_storage
from  diagnostic.prediction import Model
from datetime import *
from concurrent.futures import ThreadPoolExecutor
import json

from rest_framework import generics,status
from django.http import Http404
from .serializers import MedcineSerializer,AuthTokenSeialaizer,PtientSerialze,AnalysisSerialize,NotificationSerializer,ReportSerialze,treatementSerialize
from django.http import JsonResponse
from .models import Medcine,Patient,analyses,Notification,Treatement
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from bson import ObjectId
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.http import JsonResponse

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.db.models import Count
import stripe
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import stripe
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
import pytz
import bson
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q 
from .models import Subscription,Report
import stripe
from rest_framework.exceptions import AuthenticationFailed
from datetime import datetime, timedelta
# Set your Stripe API key outside of the class
stripe.api_key = "sk_test_51NwiSaFrMgEVRHEiSzrg0iAzvF06BTDY0D8WrS9d5wVldVIgliD3jN9n9ev6nveWtnGAmEg4oo8Pfw6xaxoEhH3X00BQ7zP83k"
class StripeWebhook(generics.CreateAPIView):
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        event = None
        try:
            # Replace the webhook secret with your actual secret
            event = stripe.Webhook.construct_event(payload, sig_header, 'whsec_e535b4b87248910095ecf3fea969039517a004c0dc40b0635866bd11f039ce3d')
        except ValueError as e:
            # Invalid payload
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if event['type'] == 'checkout.session.completed':
            user_id = event['data']['object']['metadata']['user_id']
            end_date = event['data']['object']['metadata']['end_date']
            print(request.data)
            end_date = datetime.now() + timedelta(days=30 * int(end_date))
            existing_subscription = Subscription.objects.filter(medcine_id=user_id).first()
            if existing_subscription:
                # Update the existing subscription
                existing_subscription.start_date = datetime.now()
                existing_subscription.end_date = end_date
                existing_subscription.is_subscribe = True
                existing_subscription.save()
            else:
                # Create a new subscription using your serializer
                data = {
                    "medcine": Medcine.objects.get(_id=bson.ObjectId(user_id)),
                    "start_date": datetime.now(),
                    "end_date": end_date,
                    "is_subscribe": True
                }
                serializer = Subscription.objects.create(**data)
                serializer.save()
                medcine_instance = Medcine.objects.get(_id=bson.ObjectId(user_id))
                medcine_instance.is_active = True
                medcine_instance.save()
            
        return HttpResponse(status=200)
class CreateSubscriptionAndCheckout(generics.CreateAPIView):
    def post(self, request):
        user_id = request.data.get('user_id')  # Unique identifier for the user
        amount= request.data.get('amount')
        subscription_duration_months =  request.data.get('duration')  # Adjust the subscription duration as needed
        print(request.data)
        end_date = datetime.now() + timedelta(days=30 * subscription_duration_months)

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'usd',
                            'product_data': {
                                'name': 'Subscription',
                            },
                            'unit_amount': amount*100,  # Adjust the price as needed
                        },
                        'quantity': 1,
                    },
                ],
                mode='payment',
                success_url='http://localhost:4200/login',
                cancel_url='http://localhost:4200/payment',
                metadata={
                    'user_id': user_id,  # Replace with the actual user ID
                    'email': 'user@example.com',  # Replace with the user's email
                    'name': 'John Doe',
                    'end_date':subscription_duration_months,
                }
            )

            return JsonResponse({'session_id': session.id})
        except stripe.error.StripeError as e:
            return JsonResponse({'error': str(e)}, status=500)

        

class CreatemedicineView(generics.CreateAPIView):
    serializer_class = MedcineSerializer

    def perform_create(self, serializer):
        # Save the RAD instance
        instance = serializer.save()

        # Send the welcome email (similar to the previous view)
        subject = 'Welcome to Our App'
        message = 'Thank you for creating a RAD.'
        from_email = 'ahmedmarnissilangcare@gmail.com'  # Replace with your email
        recipient_list = [instance.email]  # Replace with the relevant email field in your serializer

        # Load the email template
        context = {'user': instance.occupation, 'rad_name': instance.name}
        email_message = render_to_string('welcome_email_template.html', context)

        send_mail(subject, message, from_email, recipient_list, html_message=email_message)
        if instance.is_superuser==False:
            self.send_notification(instance, f"New user created:{instance.name}", "patient add")
        

        # Return the serialized data in the response
        return Response(instance)
        # Send a notification to all collaborations

    def is_connect(self, userId):
        client = Medcine.objects.get(_id=userId)

    def send_notification(self, user, message, notification_type):
        # Create an instance of the NotificationConsumer

       
        receiver = Medcine.objects.get(_id=user.manager_id)

        channel_layer = get_channel_layer()

        # Construct the message event
        message_event = {
            'type': 'send.notification',
            'message': message,
            'notification_type': notification_type,  # You can set your own notification type
        }

        # Use async_to_sync to send the message event to each collaboration
        if self.is_connect(receiver._id):
            receiver_channel_name = 'notification_%s' % str(receiver._id)
            async_to_sync(channel_layer.group_send)(receiver_channel_name, message_event)
        else:
            notification = Notification.objects.create(
                sender=user,
                receiver=receiver,
                message=message,
                notification_type="patient"
            )
            notification.save()
class MedicineListView(generics.ListCreateAPIView):
    serializer_class = MedcineSerializer
    def get_queryset(self):
        # Retrieve all medicines with the same manager as the currently authenticated user
        manager = ObjectId(self.request.query_params.get('medicine_id'))  # Assuming the manager is stored in the request user
        return Medcine.objects.filter(manager=manager)
class ContactListView(generics.ListCreateAPIView):
    serializer_class = MedcineSerializer
    def get_queryset(self):
        # Retrieve the manager from the request
        manager_id = self.request.query_params.get('medicine_id')

        # Start with an empty Q object
        q_filter = Q()

        # Check if manager_id is provided and add a condition to filter by manager or _id
        if manager_id:
                # Convert the manager_id string to ObjectId
                manager_id_object = ObjectId(manager_id)
                q_filter |= Q(manager=manager_id_object) | Q(_id=manager_id_object)
                print(q_filter)
        # Apply the combined filter to the queryset
        return Medcine.objects.filter(q_filter)
class MedicineDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Medcine.objects.all()
    serializer_class = MedcineSerializer
    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        pk = self.kwargs.get(self.lookup_field)
        print(pk)
        try:
            # Convert the 'id' parameter from string to ObjectId
            pk = ObjectId(pk)
            
            obj = queryset.get(pk=pk)
            return obj
    
        except Medcine.DoesNotExist:
            raise Http404("Patient not found.")
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # Use the update method from the serializer
        serializer.update(instance, serializer.validated_data)

        return Response(serializer.data)
    def perform_update(self, serializer):
        # Your performance optimization logic for update here
        instance = serializer.update()
         # Send the welcome email (similar to the previous view)
        subject = 'Account activated'
        message = 'you manager activate your account.'
        from_email = 'ahmedmarnissilangcare@gmail.com'  # Replace with your email
        recipient_list = [instance.email]  # Replace with the relevant email field in your serializer

        # Load the email template
        context = {'user': instance.occupation, 'rad_name': instance.name}
        email_message = render_to_string('welcome_email_template.html', context)
        send_mail(subject, message, from_email, recipient_list, html_message=email_message)
    def perform_destroy(self, instance):
        # Your performance optimization logic for delete here
        instance.delete()
        # Send the welcome email (similar to the previous view)
        subject = 'Welcome to Our App'
        message = 'your manager deleted you account'
        from_email = 'ahmedmarnissilangcare@gmail.com'  # Replace with your email
        recipient_list = [instance.email]  # Replace with the relevant email field in your serializer

        # Load the email template
        context = {'user': instance.occupation, 'rad_name': instance.name}
        email_message = render_to_string('welcome_email_template.html', context)
        send_mail(subject, message, from_email, recipient_list, html_message=email_message)
class SuperuserMedcineListView(generics.ListAPIView):
    queryset = Medcine.objects.filter(manager__isnull=True)
    serializer_class = MedcineSerializer
   
     
class LoginView(ObtainAuthToken):
    serializer_class = AuthTokenSeialaizer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        tz = pytz.timezone('US/Eastern')
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        is_superuser = user.is_superuser

        # Check for subscription only if the user is a superuser
        is_subscribed = False
        if is_superuser==True:
            try:
                sub = Subscription.objects.get(medcine=user._id)
                is_subscribed = sub.is_subscribe
            except Subscription.DoesNotExist:
                pass  # Handle the case when the subscription does not exist for the user

            return Response({
                'token': token.key,
                '_id': str(user._id),
                'email': user.email,
                'name': user.name,
                'is_subscribed': is_subscribed,
                'occupation': user.occupation,
                'manager':str(user.manager_id),
                'phone_number':user.phone_number,
                'photo': user.photo.url if user.photo else None,
                })
        else:
             return Response({
                'token': token.key,
                '_id': str(user._id),
                'email': user.email,
                'name': user.name,
                'is_subscribed': True,
                'occupation': user.occupation,
                'manager':str(user.manager_id),
                'phone_number':user.phone_number,
                'photo': user.photo.url if user.photo else None
                })
          
                 
  # Allows CSRF exemption for this view
class CreatePatient(generics.CreateAPIView):
    
    serializer_class = PtientSerialze
    
    def perform_create(self, serializer):
        # Create the patient
        print(serializer)
        patient = serializer.save()
        self.send_notification(patient, f"New patient created:{patient.name}", "patient add")
        # Send a notification to all collaborations

    def is_connect(self, userId):
        client = Medcine.objects.get(_id=userId)

    def send_notification(self, patient, message, notification_type):
        # Create an instance of the NotificationConsumer

        user = Medcine.objects.get(_id=patient.medicine_id)
        receiver = Medcine.objects.filter(manager=user.manager).exclude(_id=user._id).first()
        if receiver != None:
            channel_layer = get_channel_layer()

            # Construct the message event
            message_event = {
                'type': 'send.notification',
                'message': message,
                'notification_type': notification_type,  # You can set your own notification type
            }

            # Use async_to_sync to send the message event to each collaboration
            if self.is_connect(receiver._id):
                receiver_channel_name = 'notification_%s' % str(receiver._id)
                async_to_sync(channel_layer.group_send)(receiver_channel_name, message_event)
            else:
                notification = Notification.objects.create(
                    sender=user,
                    receiver=receiver,
                    message=f"New patient created:{patient.name}",
                    notification_type="patient"
                )
                notification.save()

        
class PatientRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    
    queryset = Patient.objects.all()
    serializer_class = PtientSerialze
    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        pk = self.kwargs.get(self.lookup_field)
        print(pk)
        try:
            # Convert the 'id' parameter from string to ObjectId
            pk = ObjectId(pk)
            
            obj = queryset.get(pk=pk)
            return obj
        except Patient.DoesNotExist:
            raise Http404("Patient not found.")
    def perform_update(self, serializer):
        # Update the patient
        patient = serializer.save()
        self.send_notification(bson.ObjectId(self.request.query_params.get('meidcine')), f"Patient updated: {patient.name}", "patient update")

    def perform_destroy(self, instance):
        # Delete the patient
        self.send_notification(bson.ObjectId(self.request.query_params.get('meidcine')), f"Patient deleted: {instance.name}", "patient delete")
        instance.delete()
    
    def is_connect(self, userId):
        client = Medcine.objects.get(_id=userId)

    def send_notification(self, patient, message, notification_type):
        # Create an instance of the NotificationConsumer

        user = Medcine.objects.get(_id=patient)
        receiver = Medcine.objects.filter(manager=user.manager).exclude(_id=user._id).first()
        if receiver != None:
            channel_layer = get_channel_layer()

            # Construct the message event
            message_event = {
                'type': 'send.notification',
                'message': message,
                'notification_type': notification_type,  # You can set your own notification type
            }

            # Use async_to_sync to send the message event to each collaboration
            if self.is_connect(receiver._id):
                receiver_channel_name = 'notification_%s' % str(receiver._id)
                async_to_sync(channel_layer.group_send)(receiver_channel_name, message_event)
            else:
                notification = Notification.objects.create(
                    sender=user,
                    receiver=receiver,
                    message=message,
                    notification_type="patient"
                )
                notification.save()
class PatientsWithSameMedicineView(generics.ListAPIView):
    serializer_class = PtientSerialze

    def get_queryset(self):
        # Get the medicine_id from the query parameters
        medicine_id = ObjectId(self.request.query_params.get('medicine_id'))

        # Get the user based on the medicine_id
        user = Medcine.objects.get(_id=medicine_id)

        # Get all patients associated with the medicine's manager
        patients = Patient.objects.filter(medicine__manager=user.manager)

        return patients
class analysesCreateView(generics.CreateAPIView):
    serializer_class = AnalysisSerialize
    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        pk = self.kwargs.get(self.lookup_field)
        print(pk)
        try:
            # Convert the 'id' parameter from string to ObjectId
            pk = ObjectId(pk)
            
            obj = queryset.get(pk=pk)
            return obj
        except Patient.DoesNotExist:
            raise Http404("Patient not found.")
    def post(self, request, *args, **kwargs):
    # Get the file_name from the request data
        patient = ObjectId(self.kwargs.get(self.lookup_field))
      
        
        # Create the initial analyses data dictionary
        if 'mhdFile' in request.FILES:
            image_mhd = request.FILES['mhdFile']
            image_raw = request.FILES['rawFile']
            data = {
                'patient': patient,
                'scan': image_mhd,
            }
            
        elif 'dcmFile' in request.FILES:
             image_dcm = request.FILES['dcmFile']
             data = {
                'patient': patient,
                'scan': image_dcm,
             }
        serializer = AnalysisSerialize(data=data)
       
        # Validate and save the initial serializer
        if serializer.is_valid():
            serializer.save()
            analysis_id = serializer.instance._id
            
            if 'rawFile' in request.FILES:
                default_storage.save(f'{serializer.instance._id}/{image_raw.name}', image_raw)
            print(f"Analysis ID: {analysis_id}")
            # Save the raw image to the appropriate folder

            # Now, you can start a background task for analysis here
            self.perform_analysis(serializer, patient)

            return Response(status=status.HTTP_202_ACCEPTED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_analysis(self, serializer, patient):
        
        # Perform the analysis and get the predictions (assuming predictions is a dictionary)
        model = Model()
        predictions = model.predict(serializer.instance.scan.path)

        result = predictions.get('stat', None)
        diameter = predictions.get('diameters', None)
        center = predictions.get('centers', None)
        image = predictions.get('images', None)
        nodule = predictions.get('nodule', None)

        analyses_data = {
            'result': result,
            'diameter': diameter,
            'center': str(center),
            'image': image,
            'nodule': nodule,
        }

        serializer.update(instance=serializer.instance, validated_data=analyses_data)
        
        self.send_notification(bson.ObjectId(self.request.query_params.get('meidcine')), f" add scan a patient  {patient}  .","analyse add")
       
    def is_connect(self, userId):
        client = Medcine.objects.get(_id=userId)

    def send_notification(self, patient, message, notification_type):
        # Create an instance of the NotificationConsumer

        user = Medcine.objects.get(_id=patient)
        receiver = Medcine.objects.filter(manager=user.manager).exclude(_id=user._id).first()
        if receiver != None:
            channel_layer = get_channel_layer()

            # Construct the message event
            message_event = {
                'type': 'send.notification',
                'message': message,
                'notification_type': notification_type,  # You can set your own notification type
            }

            # Use async_to_sync to send the message event to each collaboration
            if self.is_connect(receiver._id):
                receiver_channel_name = 'notification_%s' % str(receiver._id)
                async_to_sync(channel_layer.group_send)(receiver_channel_name, message_event)
            else:
                notification = Notification.objects.create(
                    sender=user,
                    receiver=receiver,
                    message=message,
                    notification_type="patient"
                )
                notification.save()


    def get(self, *args, **kwargs):
        # Get the latest analysis for the given patient_id
        patient = ObjectId(self.kwargs.get(self.lookup_field))
        try:
            analysis = analyses.objects.filter(patient=patient).latest('_id')
        except analyses.DoesNotExist:
            return Response({"error": "Analysis not found for the given patient ID."}, status=status.HTTP_404_NOT_FOUND)

        # Serialize the analysis data
        serializer = AnalysisSerialize(analysis)
        # Return the serialized data
        return Response(serializer.data)
class AnalysesPatient(generics.ListAPIView):
    queryset = analyses.objects.all()
    
    serializer_class = AnalysisSerialize

    def get_queryset(self):
        patient_id = ObjectId(self.request.query_params.get('_id'))
        print(patient_id)
        if not patient_id:
            return analyses.objects.none()
        
        return analyses.objects.filter(patient=patient_id) 
class All_analyse(generics.ListAPIView):
   
    
    serializer_class = AnalysisSerialize

    def get_queryset(self):
        queryset = analyses.objects.filter(date=date.today())
        
        # Include related patient information
        queryset = queryset.select_related('patient')  # Assuming 'patient' is the ForeignKey field in Analysis
        print(queryset)
        return queryset


class dashboardView(APIView):
 

    def get(self, request):
        medicine_id = self.request.query_params.get('medicine_id')
        user = Medcine.objects.get(_id=bson.ObjectId(medicine_id))

        # Get all patients associated with the medicine's manager
        patients = Patient.objects.filter(medicine__manager=user.manager)
        cancer_patient = patients.filter(analyses__result='cancer').count()
        non_cancer_patient = patients.filter(analyses__result='non cancer').count()
        total_patient_number = patients.count()
        todaypatient= patients.filter(analyses__date = date.today()).values()
        ana = patients.filter(analyses=None).count()
        terat = patients.filter(treatement=None).count()
        day_of_week_count = [ ]
        patient_day={}
        patients_by_day = patients.values('date_added').annotate(patient_count=Count('_id')).order_by('date_added')
        for patient in patients_by_day:
            print(patient)
            patient_day={}
            date_added = patient['date_added']
            day_of_week = date_added.strftime('%A')  # Convert date to the day of the week
            # Use the day of the week as the key in the dictionary and increment the count
            patient_day['day'] = day_of_week
            patient_day['count'] =  patient['patient_count'] 
            day_of_week_count.append(patient_day)
        patient_list = []
        for patient_data in todaypatient:
            patient_data['_id'] = str(patient_data['_id'])
            patient_data['medicine_id'] = str(patient_data['medicine_id'])
            print(patient_data)
            patient_list.append(patient_data)
            
        print(day_of_week_count)
        data = {
            "patients_add":day_of_week_count,
            "tot_patient": total_patient_number,
            "cancer_patient": cancer_patient,
            "non_cancer_patient": non_cancer_patient
            , 'today_patient':patient_list,
            'patient_non_ana':ana,
             'patient_non_treat':terat,}

        return Response(data, status=status.HTTP_200_OK)
class Createreport(generics.CreateAPIView):
    serializer_class = ReportSerialze
    def perform_create(self, serializer):
        report = serializer.save()
        self.send_notification(bson.ObjectId(self.request.query_params.get('meidcine')), f" add reorpt a patient  {report.analyse.patient.name}  .","analyse add")
       
    def is_connect(self, userId):
        client = Medcine.objects.get(_id=userId)

    def send_notification(self, patient, message, notification_type):
        # Create an instance of the NotificationConsumer

        user = Medcine.objects.get(_id=patient)
        receiver = Medcine.objects.filter(manager=user.manager).exclude(_id=user._id).first()
        if receiver != None:
            channel_layer = get_channel_layer()

            # Construct the message event
            message_event = {
                'type': 'send.notification',
                'message': message,
                'notification_type': notification_type,  # You can set your own notification type
            }

            # Use async_to_sync to send the message event to each collaboration
            if self.is_connect(receiver._id):
                receiver_channel_name = 'notification_%s' % str(receiver._id)
                async_to_sync(channel_layer.group_send)(receiver_channel_name, message_event)
            else:
                notification = Notification.objects.create(
                    sender=user,
                    receiver=receiver,
                    message=message,
                    notification_type="patient"
                )
                notification.save()

    def is_connected(self, user):
        return user.is_connected
    def get(self,request):
        print(request)
        analyze_id = request.query_params.get('analyze_id')
        print(analyze_id)
        report = Report.objects.filter(analyse_id = analyze_id).values('pdf_report')
        print(report)
        return Response(report, status=status.HTTP_200_OK)
class getPatientReport(generics.ListAPIView):
    serializer_class = Report
    def get(self,request):
        print(request)
        analyze_id = bson.ObjectId(request.query_params.get('analyze_id'))
        print(analyze_id)
        report = Report.objects.filter(analyse__patient_id = analyze_id).values('pdf_report')
        print(report)
        return Response(report, status=status.HTTP_200_OK)
class PatientReports(generics.ListAPIView):
    queryset = Patient.objects.all()
    
    serializer_class = PtientSerialze # Replace 'PatientSerializer' with the actual serializer for Patient.
    
    def get_queryset(self):
        # Query patients who have associated reports
        
        return Patient.objects.filter(analyses__report__isnull=False).distinct()
    

class createTreatement(generics.CreateAPIView):
    serializer_class = treatementSerialize
    def perform_create(self, serializer):
        treat = serializer.save()
        self.send_notification(bson.ObjectId(self.request.query_params.get('meidcine')), f" add treatement a patient  {treat.patient.name}  .","analyse add")
       
    def is_connect(self, userId):
        client = Medcine.objects.get(_id=userId)

    def send_notification(self, patient, message, notification_type):
        # Create an instance of the NotificationConsumer

        user = Medcine.objects.get(_id=patient)
        receiver = Medcine.objects.filter(manager=user.manager).exclude(_id=user._id).first()
        if receiver != None:
            channel_layer = get_channel_layer()

            # Construct the message event
            message_event = {
                'type': 'send.notification',
                'message': message,
                'notification_type': notification_type,  # You can set your own notification type
            }

            # Use async_to_sync to send the message event to each collaboration
            if self.is_connect(receiver._id):
                receiver_channel_name = 'notification_%s' % str(receiver._id)
                async_to_sync(channel_layer.group_send)(receiver_channel_name, message_event)
            else:
                notification = Notification.objects.create(
                    sender=user,
                    receiver=receiver,
                    message=message,
                    notification_type="patient"
                )
                notification.save()
class TreatementListView(generics.ListAPIView):
    serializer_class = treatementSerialize
    def get_queryset(self):
        # Get the medicine_id from the query parameters
        medicine_id = ObjectId(self.request.query_params.get('medicine_id'))

        # Get the user based on the medicine_id
        user = Medcine.objects.get(_id=medicine_id)

        # Get all patients associated with the medicine's manager
        patients = Patient.objects.filter(medicine__manager=user.manager)
        print(patients)
        treat = Treatement.objects.filter(patient__in =patients)
        print(treat)
        return treat
