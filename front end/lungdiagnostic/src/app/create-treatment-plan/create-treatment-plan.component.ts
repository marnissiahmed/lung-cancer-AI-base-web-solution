import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MedicineService } from '../services/medicine.service';
import { User } from '../shared/medicine_model';
import { Subscription } from 'rxjs';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-create-treatment-plan',
  templateUrl: './create-treatment-plan.component.html',
  styleUrls: ['./create-treatment-plan.component.css']
})
export class CreateTreatmentPlanComponent implements OnInit {
  treatmentPlanForm: FormGroup;
patient:any;
reports:any;
pdfUrl:SafeUrl[] = [];
private readonly notifier: NotifierService;
  constructor(private fb: FormBuilder,private med:MedicineService,private http:HttpClient,private sanitizer:DomSanitizer , notifier:NotifierService,
    
    ) {
      this.notifier = notifier;
    } 
  medicine:User;
  sub: Subscription;
  ngOnInit(): void {
    this.sub = this.med.user.subscribe(
      (data: User) => {
        this.medicine = data
       
      })
this.patient = history.state.user
let params = new HttpParams()
              .set('analyze_id', this.patient._id)
this.http.get("http://127.0.0.1:8000/api/accounts/patient_reports/", { params: params }).subscribe((data=>
{
  console.log(data)
  this.reports = data
  for(let  rep of this.reports){
  const url = this.sanitizer.bypassSecurityTrustResourceUrl('http://127.0.0.1:8000/'+rep.pdf_report);
  this.pdfUrl.push(url)

  }
}))
    this.treatmentPlanForm = this.fb.group({
      
      description: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      
      // Add more form controls as needed
    });
  }

  onSubmit() {
    if (this.treatmentPlanForm.valid) {
      this.treatmentPlanForm.addControl('patient', this.fb.control(this.patient._id))
      const formData = this.treatmentPlanForm.value;
      console.log(formData)
      let params = new HttpParams()
    .set('meidcine',this.medicine.id)
      this.http.post("http://127.0.0.1:8000/api/accounts/patient/createTreatement/",formData,{ params: params }).subscribe((data)=>
      {
        this.notifier.notify('success','treatement add   successfully');
        
      },(error) => {
      
        // Show an error message to the user
        this.notifier.notify('error',error);
      })
      
        // Handle success or error
      
    }
  }
}
