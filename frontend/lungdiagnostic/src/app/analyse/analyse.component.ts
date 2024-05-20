import { Component, OnInit,ViewChild, ElementRef,   } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SharedService } from '../services/shared.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PatientService } from '../services/patient.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../shared/medicine_model';
import { Subscription } from 'rxjs';
import { MedicineService } from '../services/medicine.service';

@Component({
  selector: 'app-analyse',
  templateUrl: './analyse.component.html',
  styleUrls: ['./analyse.component.css']
})

export class AnalyseComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvas: ElementRef;
  id:string;
  fileName: string;
  predictions:any;
  report:any= 0;
  pdfUrl:SafeUrl;
  state:any;
  center:any[]=[];
  diameter:any[] = [];
  image:SafeUrl;
  date:Date;
  oldImageDiagnosticUrl:SafeUrl;
  noduleImageUrl:SafeUrl;
 patient:any;
 noduleImageUrls: SafeUrl[] = [];
  // Create a fake patient object
nodule:any;
medicine:User;
stat:any;
sub: Subscription;
  
  constructor(private patientservice: PatientService,private route:ActivatedRoute ,private medicineserver:MedicineService,private sanitizer: DomSanitizer,private router:Router,private http:HttpClient) { }

  ngOnInit(): void {
    // Retrieve the fileName from the shared service
    this.sub = this.medicineserver.user.subscribe(
      (data: User) => {
        this.medicine = data
       
      })
    this.predictions = history.state.predictions;
    this.patient = history.state.user;
    
        this.state = this.predictions.result;

        this.center = this.predictions.center.split("), ");
        this.diameter = this.predictions.diameter.split(", ");
        
        this.date = this.predictions.date
        this.image = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + this.predictions.image);
        if (this.predictions.nodule!==null){
          this.nodule = this.predictions.nodule.replace("['", '').replace("']", '');
       
         
        const imageList = this.nodule.split("', '");
        
        for (const imageData of imageList) {
           
          const imageUrl = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + imageData);
          
          this.noduleImageUrls.push(imageUrl);
        
              }
              
            }
              let params = new HttpParams()
              .set('analyze_id', this.predictions._id).set('meidcine',this.medicine.id) // Include user-specific data as needed
    this.http.get("http://127.0.0.1:8000/api/accounts/patient/Report/", { params: params }).subscribe((data=>
    {
      console.log(data)
      this.report = data
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('http://127.0.0.1:8000/'+this.report[0].pdf_report);
     

    }))

  }
  repport(){
    const user = this.patient
    console.log(this.noduleImageUrls)
    this.router.navigate(['navbar', 'rapport',this.patient._id], { state: { user,nodule:this.nodule,analyse:this.predictions._id } });
  }
}
