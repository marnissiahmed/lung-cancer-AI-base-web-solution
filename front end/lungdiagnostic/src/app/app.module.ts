import { BrowserModule,DomSanitizer  } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry  } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';;
import { AddscanComponent } from './addscan/addscan.component';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { PatientlistComponent } from './patientlist/patientlist.component';
import { HttpClientModule } from '@angular/common/http';
import { AnalyseComponent } from './analyse/analyse.component';
import { LoginComponent } from './login/login.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AddpatientComponent } from './addpatient/addpatient.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PaymentandinfoComponent } from './paymentandinfo/paymentandinfo.component';
import { StatepageComponent } from './statepage/statepage.component';
import { UpdatePatientComponent } from './update-patient/update-patient.component';
import { DetailsComponent } from './details/details.component';
import { MatDividerModule } from '@angular/material/divider';
import { HomeComponent } from './home/home.component';
import { NgChartjsModule } from 'ng-chartjs';
import { DashComponent } from './dash/dash.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { LayoutModule } from '@angular/cdk/layout';
import { CardComponent } from './card/card.component';
import { RepportComponent } from './repport/repport.component';
import { CreateTreatmentPlanComponent } from './create-treatment-plan/create-treatment-plan.component';
import { NotifierModule } from 'angular-notifier';
import { MatSelectModule } from '@angular/material/select';
import { MatBadgeModule } from "@angular/material/badge";
import { ChatComponent } from './chat/chat.component';
import { TreatementComponent } from './treatement/treatement.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TraitmentDetaisComponent } from './traitment-detais/traitment-detais.component';
import { ProfileComponent } from './profile/profile.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    
    AddscanComponent,
   
    PatientlistComponent,
   
    
   
    AnalyseComponent,
   
    
   
    LoginComponent,
   
    
   
    AddpatientComponent,
   
    
   
    PaymentandinfoComponent,
   
    
   
    StatepageComponent,
   
    
   
    UpdatePatientComponent,
   
    
   
    DetailsComponent,
   
    
   

   
    
   
    HomeComponent,
   
    
   

   
    
   
    DashComponent,
   
    
   

   
    
   
    CardComponent,
   
    
   

   
    
   
    RepportComponent,
   
    
   

   
    
   
    CreateTreatmentPlanComponent,
   
    
   

   
    
   
  
   
    
   

   
    
   
    ChatComponent,
   
    
   

   
    
   
  
   
    
   

   
    
   
    TreatementComponent,
   
    
   

   
    
   
  
   
    
   

   
    
   
    TraitmentDetaisComponent,
   
    
   

   
    
   
  
   
    
   

   
    
   
    ProfileComponent,
   
    
  ],
  imports: [
    FormsModule,
    NotifierModule.withConfig({
      position: {
        horizontal: {
          position: 'middle',
          distance: 12
        },
        vertical: {
          position: 'top',
          distance: 12,
          gap: 10
        }
      },
      theme: 'material',
      behaviour: {
        autoHide: 5000,
        onClick: 'hide',
        onMouseover: 'pauseAutoHide',
        showDismissButton: true,
        stacking: 4
      },
      animations: {
        enabled: true,
        show: {
          preset: 'slide',
          speed: 300,
          easing: 'ease'
        },
        hide: {
          preset: 'fade',
          speed: 300,
          easing: 'ease',
          offset: 50
        },
        shift: {
          speed: 300,
          easing: 'ease'
        },
        overlap: 150
      }
    }),
    MatBadgeModule,
    MatProgressSpinnerModule,
    NgChartjsModule,
    MatSnackBarModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatInputModule,
    MatCardModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule,
    DragDropModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatGridListModule,
    LayoutModule,
    MatSelectModule,
    MatDividerModule,

  ],
  exports: [
    
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatInputModule,
    MatCardModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule,
    DragDropModule,
    MatIconModule,
    MatSelectModule,
],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { 
constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
  // Register the SVG icon file
  this.matIconRegistry.addSvgIcon(
    'myIcon',
    this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/patientadd.svg")
  );
}
}