import { Component, OnInit } from '@angular/core';
import { PatientService } from '../services/patient.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
patient:any;
analyses:any = [];
image:SafeUrl[]=[];
  constructor(private patientser:PatientService,private sanitizer: DomSanitizer,private route:Router) { }

  ngOnInit(): void {
    this.patient = history.state.user;
    console.log(this.patient)
    this.patientser.get_all_analyse(this.patient._id).subscribe((response:any)=>{
    this.analyses= response,
    this.image = this.analyses.map(analyse => this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + analyse.image));
        console.log(this.analyses);
    console.log(this.analyses)
    }
    ,(error: any) => {
      console.error('Error:', error);
    })
  }
analyse(predictions:any){
  this.route.navigate(['navbar','analyse',this.patient._id],{ state:{ predictions,user:this.patient}});
}

}

