import { Component, OnInit,ViewChild, Output } from '@angular/core';

import { MatSidenav } from '@angular/material/sidenav';
import { NotifierService } from 'angular-notifier';

import { ActivatedRoute, Router } from '@angular/router';

import { User } from '../shared/medicine_model';
import { Subscription } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MedicineService } from '../services/medicine.service';
import { ManagerService } from '../services/manager.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
  @ViewChild(MatSidenav) sidenav: MatSidenav;
  @Output() isChatVisible: boolean = false;
  @Output() id: string ='';
badgevis = false;
  collapseOpen: boolean = false;
  modalSearch: boolean = false;
  color: string = 'navbar-transparent';
  medicine:User;

  sub: Subscription;
  sidebarWidth:any; 
  notification_number:number;
  notifications: any[] = [];
  
  currentView: 'chat' | 'contacts' = 'chat';
  switchToView(view: 'chat' | 'contacts', event: MouseEvent) {
    // Prevent the click event from propagating and closing the menu
    event.stopPropagation();
  
    // Handle switching between chat and contacts
    this.currentView = view;
  }
  private readonly notifier: NotifierService;
  constructor(private observer: BreakpointObserver,public medicineserver:MedicineService,private router:Router,private manager:ManagerService,notifier:NotifierService ) {
    // Register the SVG icon
    this.notifier = notifier;
  }
  notificationsActive: boolean = false;
  toggleChatVisibility(_id:any) {
    this.isChatVisible = !this.isChatVisible;
    this.id = _id
  }
  toggleNotifications() {
    this.notificationsActive = !this.notificationsActive;
    console.log(this.notificationsActive)
  }
  toggleCollapse() {
    
    this.collapseOpen = !this.collapseOpen;
    const sidenavElement = document.querySelector('.mat-sidenav');
    if (this.collapseOpen) {
      sidenavElement.classList.add('sidenav-opened');
      
    } else {
      sidenavElement.classList.remove('sidenav-opened');
    }
  }
  

  toggleModalSearch() {
    this.modalSearch = !this.modalSearch;
  }
  orga:any;
  medicines = []
  ngOnInit(): void {
    this.sub = this.medicineserver.user.subscribe(
      (data: User) => {
        this.medicine = data
        console.log('user',this.medicine)
       
      })
      
          this.manager.getAllMedicines(this.medicine.id).subscribe((data)=>
          {
              this.medicines = data
              console.log(data)
          })
          if (this.medicine.occupation ==="admin")
          { this.medicineserver.getcontact(this.medicine.id).subscribe((data)=>
            {
              console.log(data)
              this.orga =  data
            })}
         else{
          this.medicineserver.getcontact(this.medicine.manager).subscribe((data)=>
            {
              console.log(data)
              this.orga =  data
            })}
      
      this.medicineserver.connectToWebSocket(this.medicine.id);
      this.medicineserver.getNotifications().subscribe((notification) => {
        this.notifications.push(notification);
        console.log("notfication",notification)
       
      });
     
  
  }
  activate(doctor:any){
   const UpdateUser = doctor;
   UpdateUser.is_active = true;
   console.log(UpdateUser)
    this.manager.updateMedicine(doctor._id,UpdateUser).subscribe((res)=>
    {
      
      this.notifier.notify('success', 'account activate successfully  ')
    })
  }
  deleteDoctor(doctor:any){
    this.manager.deleteMedicine(doctor._id).subscribe(() => {
      this.notifier.notify('success', 'account delet successfully  ')
    this.medicines = this.medicines.filter((med) => med._id !== doctor._id);
    })
  }
  LogOut(){
    this.medicineserver.logout()
      // Handle error
    }


  
}

    
   
     


