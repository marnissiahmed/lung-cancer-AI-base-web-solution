import { Component, OnInit ,Input} from '@angular/core';
import {HttpClient,HttpHeaders } from '@angular/common/http';
import { MedicineService } from '../services/medicine.service';
import { User } from '../shared/medicine_model';
import { NotifierService } from 'angular-notifier';

import { Subscription } from 'rxjs';
import { FormGroup,FormControl,Validators, AbstractControl } from '@angular/forms';
const baseUrl='http://127.0.0.1:8000/'
@Component({
  selector: 'app-addpatient',
  templateUrl: './addpatient.component.html',
  styleUrls: ['./addpatient.component.css']
})

export class AddpatientComponent implements OnInit {
  medicine:User;
  sub: Subscription;
  signupForm: FormGroup;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  private readonly notifier: NotifierService;
  constructor(private http: HttpClient, private medicineserve:MedicineService, notifier:NotifierService) { 
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
  ngOnInit(): void {
    this.sub = this.medicineserve.user.subscribe(
      (data: User) => {
        this.medicine = data
        console.log(data)
      }
    )
    this.signupForm = new FormGroup({
      'firstName': new FormControl(null, Validators.required),
      'lastName': new FormControl(null, Validators.required),
      'email': new FormControl(null, Validators.required),
      'location': new FormControl(null, Validators.required), // Remove extra Validators.required
      'age': new FormControl(null, [Validators.required]),
      
        
        
      
    });
   
  }
  
  addPatient() {
 

    const formData = new FormData();
  
   
    formData.append('name', this.signupForm.get('firstName').value);
    formData.append('last_name', this.signupForm.get('lastName').value);
    formData.append('email', this.signupForm.get('email').value);
    formData.append('location', this.signupForm.get('location').value);
    formData.append('age', this.signupForm.get('age').value);
    
    formData.append('medicine',this.medicine.id);
  
    if (this.imageFile) {
      formData.append('photo', this.imageFile);
    }
    
  
    const apiUrl = baseUrl + 'api/accounts/addpatient/';
   
   
    // Retrieve the session cookie from storage (e.g., a cookie or custom header)
     // Replace '...' with the stored session cookie
  
    console.log(formData)
    this.http.post(apiUrl, formData)
      .subscribe(response => {
        console.log('Patient added successfully');
        this.notifier.notify('success', 'Patient added successfully')
      }, error => {
        console.error('Failed to add patient');
        this.notifier.notify('error',error)
      });
  }
}  