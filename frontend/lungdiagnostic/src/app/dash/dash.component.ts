import { Component,OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { ChartDataSets,ChartOptions } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { MedicineService } from '../services/medicine.service';
import { User } from '../shared/medicine_model';
import { Subscription } from 'rxjs';
import { Route } from '@angular/compiler/src/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.css']
})
export class DashComponent implements  OnInit{
  today :any[]
  tot:any;
  cancer:any;
  non_cancer:any;
  non_ana:any;
  non_treat:any;
  /** Based on the screen size, switch from standard to one column per row */
  barChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
  ];
 
  
  cardLayout = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return {
          columns: 1,
          miniCard: { cols: 1, rows: 4 }, // Change rows to 4 to accommodate 4 mini-cards
          chart: { cols: 4, rows: 2 },
        };
      }
    
      return {
        columns: 5,
        miniCard: { cols: 1, rows: 4 }, // Change cols to 1 and rows to 4 for 4 mini-cards
        chart: { cols: 3, rows: 2 },
      };
    })
    
  );
  barChartLabels: string[] = ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7'];
  
  barChartOptions: ChartOptions = {
    responsive: true,
  };

  pieChartData: ChartDataSets[] = [];
 

  chartOptions = {
    responsive: true,
  };
  pieChartLabels: string[] = ['cancer', 'non cancer',];
  
  pieChartOptions: ChartOptions = {
    responsive: true,
  };
  private apiUrl ='http://127.0.0.1:8000/api/accounts/'
  medicine:User;
  sub: Subscription;
  constructor(private breakpointObserver: BreakpointObserver, private http :HttpClient,private medicineserver:MedicineService,private router:Router) {}

  ngOnInit(): void {
    this.sub = this.medicineserver.user.subscribe(
      (data: User) => {
        this.medicine = data
       
      })
    this.http.get(`${this.apiUrl}patient/dashboard/?medicine_id=${this.medicine.id}`).subscribe((dash)=>
    {
      console.log(dash)
      this.tot = dash['tot_patient']
      this.cancer = dash['cancer_patient']
      this.non_cancer = dash['non_cancer_patient']
      this.today = dash['today_patient']
      this.non_ana = dash['patient_non_ana']
      this.non_treat = dash['patient_non_treat']
      const chartData = [
        {
          data: dash["patients_add"].map((item: any) => item.count),
          label: 'patient add A',
        },
      ];
      this.barChartData = chartData;
      this.barChartLabels = dash["patients_add"].map((item: any) => item.day);
      const piedata = [
        { data: [(dash["cancer_patient"]*100)/27, (dash["non_cancer_patient"]*100)/27],
       
       }
      ];
      this.pieChartData = piedata;
    })
    
    
      
  }
  daitlse(user){
    console.log('Row clicked:');
    this.router.navigate(['navbar', 'details'],{ state: { user } });
  }
}

