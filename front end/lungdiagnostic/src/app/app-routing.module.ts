import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentandinfoComponent } from './paymentandinfo/paymentandinfo.component';
import { PatientlistComponent } from './patientlist/patientlist.component';
import { AddscanComponent } from './addscan/addscan.component';
import { AnalyseComponent } from './analyse/analyse.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './login/login.component';
import { AddpatientComponent } from './addpatient/addpatient.component';
import { AppComponent } from './app.component';
import { StatepageComponent } from './statepage/statepage.component';
import { UpdatePatientComponent } from './update-patient/update-patient.component';
import { DetailsComponent } from './details/details.component';
import { DashComponent } from './dash/dash.component';
import { HomeComponent } from './home/home.component';
import { report } from 'process';
import { RepportComponent } from './repport/repport.component';
import { CreateTreatmentPlanComponent } from './create-treatment-plan/create-treatment-plan.component';
import { ChatComponent } from './chat/chat.component';
import { TreatementComponent } from './treatement/treatement.component';
import { TraitmentDetaisComponent } from './traitment-detais/traitment-detais.component';
import { ProfileComponent } from './profile/profile.component';
const routes: Routes = [
 
  {path: '', component:StatepageComponent},
{ path:'payment',component:PaymentandinfoComponent},
  { path: 'login', component: LoginComponent },
  {
    path: 'navbar',
    component: NavbarComponent,
    children: [
      {path:"profile",component:ProfileComponent},
      {path:'chat',component:ChatComponent},
      { path: '', redirectTo: 'home', pathMatch: 'full' },
     {path:'home',component:HomeComponent},
      { path: 'patientlist', component: PatientlistComponent },
      {path:'dashboard',component:DashComponent},
      { path: 'create-treatment-plan', component: TreatementComponent },
      { path: 'plan', component: TraitmentDetaisComponent },
      { path: 'treatment', component: CreateTreatmentPlanComponent },
      { path: 'addscan/:id', component: AddscanComponent,},
      { path: 'analyse/:id', component: AnalyseComponent },
      {path:'rapport/:id', component:RepportComponent},
      { path: 'update/:id', component: UpdatePatientComponent },
      {path:'add_patient',component:AddpatientComponent},
      {path:'details',component:DetailsComponent}
      // Define other child routes as needed
    ]
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
