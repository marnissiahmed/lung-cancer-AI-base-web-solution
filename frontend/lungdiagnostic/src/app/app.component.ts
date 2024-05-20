import { Component,OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MedicineService } from './services/medicine.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit {
  title = 'lungdiagnostic';
  constructor(private route:ActivatedRoute,private router:Router,private medicineService: MedicineService) {
    this.medicineService.autologin();
   }
   ngOnInit() {
       
   }
}
