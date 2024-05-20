import { Component, OnInit } from '@angular/core';
import { FormGroup,FormControl,Validators } from '@angular/forms';
import { PatientService } from '../services/patient.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { MedicineService } from '../services/medicine.service';
import { User } from '../shared/medicine_model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-update-patient',
  templateUrl: './update-patient.component.html',
  styleUrls: ['./update-patient.component.css']
})
export class UpdatePatientComponent implements OnInit {
  oldpatient :any;
  signupForm: FormGroup;
  id:any;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  private readonly notifier: NotifierService;
  constructor(private patientser:PatientService, private route:ActivatedRoute,private medicineserve:MedicineService, notifier:NotifierService) { 
    this.notifier = notifier;
   }
  onImageChange(event: any) {
    this.imageFile = event.target.files[0];

    // Update the image preview
    if (this.imageFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result; // Set the data URL
      };
      reader.readAsDataURL(this.imageFile);
    } else {
      this.imagePreview = null;
    }
  }
  medicine:User;
  sub: Subscription;
  ngOnInit(): void {
    this.oldpatient = history.state.user;
    this.sub = this.medicineserve.user.subscribe(
      (data: User) => {
        this.medicine = data
       
      })
    console.log(this.oldpatient)
    this.route.params.subscribe((params) => {
      this.id = params['id'];})
    this.signupForm = new FormGroup({
      'firstName': new FormControl(this.oldpatient.name, Validators.required),
    'lastName': new FormControl(this.oldpatient.last_name, Validators.required),
    'email': new FormControl(this.oldpatient.email, Validators.required),
    'location': new FormControl(this.oldpatient.location, Validators.required),
    'age': new FormControl(this.oldpatient.age, [Validators.required]),
    'phone': new FormControl(this.oldpatient.phone_number, [Validators.required])
    
      
    });
  }
  saveChanges() {
    const formData = new FormData();
  
    formData.append('_id', this.id);
    formData.append('name', this.signupForm.get('firstName').value);
    formData.append('last_name', this.signupForm.get('lastName').value);
    formData.append('email', this.signupForm.get('email').value);
    formData.append('location', this.signupForm.get('location').value);
    formData.append('age', this.signupForm.get('age').value);
    formData.append('phone_number', this.signupForm.get('phone').value);
    formData.append('medicine', this.oldpatient.medicine);
  
    if (this.imageFile) {
      formData.append('photo', this.imageFile);
    }
  
    this.patientser.updatePatient(this.id, formData,this.medicine).subscribe(
      (response: any) => {
        this.notifier.notify('success','Patient information updated successfully');
      },
      (error: any) => {
        console.error('Error updating patient information', error);
        this.notifier.notify('error','Error updating patient information. Please try again later.');
      }
    );
  }
}
