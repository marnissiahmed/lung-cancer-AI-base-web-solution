from django.urls import path
from lungdiagnostic import views
urlpatterns = [
  
    path('signup/',views.CreatemedicineView.as_view(),name='signup'),
    path('superuser/medicines/', views.SuperuserMedcineListView.as_view(), name='superuser_medicine_list'),
    path('login/',views.LoginView.as_view(),name='login'),
    path('patient_reports/',views.getPatientReport.as_view()),
    path('addpatient/', views.CreatePatient.as_view(),name='add patient'),
     path('patients/curd/<str:pk>/', views.PatientRetrieveUpdateDeleteView.as_view(), name='patient-retrieve-update-delete'),
    path('patients/same_medicine/', views.PatientsWithSameMedicineView.as_view(), name='patients-with-same-medicine'),
    path('alltreatment/',views.TreatementListView.as_view()),
    path('patients/analyses/<str:pk>/',views.analysesCreateView.as_view(),name="analyses_scan"),
path('patient/analysesPatient/',views.AnalysesPatient.as_view(),name='analyse_patient'),
path('patient/allAnalyse/',views.All_analyse.as_view(),name='today analyses'),
path("patient/payment/",views.CreateSubscriptionAndCheckout.as_view(),name="payement"),
path('patient/complete_hook/', views.StripeWebhook.as_view()),
path('patient/dashboard/',views.dashboardView.as_view()),
path("patient/Report/",views.Createreport.as_view()),
path("patient/getReport/",views.PatientReports.as_view()),
path('patient/createTreatement/',views.createTreatement.as_view()),
path('medicines/', views.MedicineListView.as_view(), name='medicine-list'),
path('contact/',views.ContactListView.as_view()),
path('medicines/<str:pk>/', views.MedicineDetailView.as_view(), name='medicine-detail')
]
