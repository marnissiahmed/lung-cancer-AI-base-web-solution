import { Component, OnInit } from '@angular/core';
import { ManagerService } from '../services/manager.service';
import { MedicineService } from '../services/medicine.service';
import { User } from '../shared/medicine_model';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  saveButtonVisible:boolean=false;
  fields:any;
  constructor(private manager:ManagerService,private medicineserver : MedicineService,private fb: FormBuilder) { }
medicine:User
sub:Subscription;
editMode=false;
udate:any;
imagePreview:any;
selectedFile: File | null = null;
profileForm: FormGroup;
  ngOnInit(): void {
    this.sub = this.medicineserver.user.subscribe(
      (data: User) => {
        this.medicine = data
       
      })
    
    this.fields = [
      { id: 'name', label: 'First Name', value:this.medicine.name , type: 'text', editMode: false, tabindex: 1 },
      { id: 'email', label: 'Email', value: this.medicine.email, type: 'email', editMode: false, tabindex: 2 },
      { id: 'phone_number', label: 'Phone Number', value:this.medicine.phone_number, type: 'tel', editMode: false, tabindex: 3 },
      { id: 'occupation', label: 'Occupation', value:this.medicine.occupation, type: 'text', editMode: false, tabindex: 4 }
      // Add other fields based on your requirements
    ];
    
    this.profileForm = this.fb.group({});
    this.fields.forEach((field) => {
      this.profileForm.addControl(field.id, this.fb.control(field.value));
    });
  }
  toggleEditMode(field: any) {
    field.editMode = !field.editMode;
  }

  cancelEdit(field: any) {
    field.editMode = false;
  }

  onFileSelected(event: any) {
    const file: File = (event.target as HTMLInputElement).files![0];
    this.selectedFile = file;
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result; // Set the data URL
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.imagePreview = null;
    }
  }
  

  saveChanges(field: any) {
    // Check if a file is selected
    const formData: FormData = new FormData();
    
    formData.append('name', this.profileForm.get('name').value);
  formData.append('phone_number', this.profileForm.get('phone_number').value);
  formData.append('email', this.profileForm.get('email').value);
  formData.append('occupation', this.profileForm.get('occupation').value)
  
    if (this.selectedFile) {
      // Create FormData object
      formData.append('photo', this.selectedFile, this.selectedFile.name);
    }
      // Upload the file
    this.manager.updateMedicine(this.medicine.id,formData).subscribe(
        (data) => {
          // Handle success, if needed
          console.log('File uploaded successfully', data);
        },
        (error) => {
          // Handle error, if needed
          console.error('File upload failed', error);
        }
      );
    

    // ... (your existing saveChanges logic)
  }
}