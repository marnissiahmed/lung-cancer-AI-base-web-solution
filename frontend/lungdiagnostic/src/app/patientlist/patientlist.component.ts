import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientService } from '../services/patient.service';
import { User } from '../shared/medicine_model';
import { MedicineService } from '../services/medicine.service';
import { Subscription } from 'rxjs';
import { state } from '@angular/animations';

@Component({
  selector: 'app-patientlist',
  templateUrl: './patientlist.component.html',
  styleUrls: ['./patientlist.component.css']
})
export class PatientlistComponent implements OnInit {
  medicine:User;
  sub: Subscription;
  patients: any = [];



  constructor(private router:Router,private patientService: PatientService,private medicineserve:MedicineService) {
    // Generate some fake user data
    
}

    ngOnInit(): void {
      this.sub = this.medicineserve.user.subscribe(
        (data: User) => {
          this.medicine = data
          console.log(data)
        })
        
      this.patientService.getPatientsWithSameMedicine(this.medicine.id).subscribe((data) => {
        this.patients = data;

        console.log(data)
      });
    }
    ngOnDestroy() {
      // Unsubscribe from the user data subscription to avoid memory leaks
      this.sub.unsubscribe();
    }
  
    editPatient(id: number,user): void {
      
   this.router.navigate(['navbar','update', id],{ state: { user } });
    }
  
    deletePatient(id: string): void {
        this.patientService.deletePatient(id,this.medicine).subscribe(() => {
          this.patients = this.patients.filter((patient) => patient._id !== id);
        });
      }
    
    
  
  
  onadd(user:any){
    this.router.navigate(['navbar', 'addscan',user._id],{ state: { user } });
    
  }
  daitlse(user){
    console.log('Row clicked:');
    this.router.navigate(['navbar', 'details'],{ state: { user } });
  }
}

