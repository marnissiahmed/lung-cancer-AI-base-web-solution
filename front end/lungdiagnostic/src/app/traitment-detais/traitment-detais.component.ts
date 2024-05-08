import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MedicineService } from '../services/medicine.service';
import { User } from '../shared/medicine_model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-traitment-detais',
  templateUrl: './traitment-detais.component.html',
  styleUrls: ['./traitment-detais.component.css']
})
export class TraitmentDetaisComponent implements OnInit {
  constructor(private http:HttpClient,private route:Router,private medicineserver:MedicineService) { }
  patients:any = []
  patient:any
  medicine:User;
  treatement:any[] =[]
    stat:any;
    sub: Subscription;
    ngOnInit(): void {
      this.sub = this.medicineserver.user.subscribe(
        (data: User) => {
          this.medicine = data
         
        })
     
  this.http.get(`http://127.0.0.1:8000/api/accounts/alltreatment/?medicine_id=${this.medicine.id}`).subscribe((data:any[])=>
  {
    console.log(data)
    this.treatement = data
    console.log(this.treatement)
  })
  
    }
    addTreatment(){
      this.route.navigate(['navbar','create-treatment-plan'])
    }
  
  }
