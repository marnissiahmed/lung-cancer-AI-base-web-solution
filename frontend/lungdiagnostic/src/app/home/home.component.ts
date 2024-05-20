import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PatientService } from '../services/patient.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { MedicineService } from '../services/medicine.service';
import { User } from '../shared/medicine_model';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
 users:any;
  medicine:User;
  sub: Subscription;
  constructor(private medcineser:MedicineService,private router:Router, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.sub = this.medcineser.user.subscribe(
      (data: User) => {
        this.medicine = data
        console.log(data)
      })
      
  
    
   
  }
}
      
    