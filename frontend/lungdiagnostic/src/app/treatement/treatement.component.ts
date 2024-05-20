import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../shared/medicine_model';
import { Subscription } from 'rxjs';
import { MedicineService } from '../services/medicine.service';

@Component({
  selector: 'app-treatement',
  templateUrl: './treatement.component.html',
  styleUrls: ['./treatement.component.css']
})
export class TreatementComponent implements OnInit {

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
    this.http.get('http://127.0.0.1:8000/api/accounts/patient/getReport/').subscribe((data)=>
    {
      this.patients = data
     
      
    })
this.http.get(`http://127.0.0.1:8000/api/accounts/alltreatment/?medicine_id=${this.medicine.id}`).subscribe((data:any[])=>
{
  console.log(data)
  this.treatement = data
  console.log(this.treatement)
})

  }
  treat(patient:any){
    this.route.navigate(['navbar','treatment'],{ state:{user:patient}})
  }

}
