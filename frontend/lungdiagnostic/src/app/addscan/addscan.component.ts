import { Component, OnInit, Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../services/shared.service';
import { PatientService } from '../services/patient.service';
import { NotifierService } from 'angular-notifier';
import { User } from '../shared/medicine_model';
import { Subscription } from 'rxjs';
import { MedicineService } from '../services/medicine.service';
@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-addscan',
  templateUrl: './addscan.component.html',
  styleUrls: ['./addscan.component.css'],
  animations: [
    trigger('loadingBar', [
      state('void', style({ width: 500 })),
      transition(':enter', animate('300ms', style({ width: '*' })))
    ])
  ]
})

export class AddscanComponent implements OnInit {
  id: string;
  @Input() fileName: any;
  showLoadingBar: boolean = false;
  selector = false;
  predictions: any;
  durationInSeconds:any=0;
  private readonly notifier: NotifierService;

  constructor(
    private medicineserver:MedicineService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private sharedService: SharedService,
    private patientser: PatientService,
    notifier:NotifierService,
    
  ) {
    this.notifier = notifier;
  }

  patient: any;
  mhdFile: File;
  rawFile: File;
  dcmFile: File;

  handleFileInput(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file: File = files[i];
      const extension: string = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'mhd') {
        this.mhdFile = file;
      } 
      else if (extension === 'raw') {
        this.rawFile = file;
      } 
      else if (extension === 'dcm') {
        this.dcmFile = file;
      }
    }
    
    if ((this.mhdFile && this.rawFile) || this.dcmFile) {
      this.selector = true;
      this.sharedService.fileName = this.mhdFile ? this.mhdFile.name : this.dcmFile.name;
    } else {
      this.notifier.notify('error','Please select both .mhd and .raw files together or a .dcm file.');
    }
  }
  medicine:User;
  stat:any;
  sub: Subscription;
  ngOnInit(): void {
    this.patient = history.state.user;
    this.sub = this.medicineserver.user.subscribe(
      (data: User) => {
        this.medicine = data
       
      })
    
   
  }

 
  uploadFiles(): void {
    this.showLoadingBar = true
    const start = new Date().getTime();
    
    const uploadData = new FormData();
    this.durationInSeconds= this.durationInSeconds+20
    if (this.mhdFile && this.rawFile) {
      uploadData.append('mhdFile', this.mhdFile, this.mhdFile.name);
      uploadData.append('rawFile', this.rawFile, this.rawFile.name);
      this.durationInSeconds= this.durationInSeconds+20
    } else if (this.dcmFile) {
      uploadData.append('dcmFile', this.dcmFile, this.dcmFile.name);
      this.durationInSeconds= this.durationInSeconds+20
    }

  
    // Calculate the actual duration based on the specified duration const actualDurationInSeconds = Math.max(specifiedDurationInSeconds, minimumDurationInSeconds);
  
    setTimeout(() => {
      // This code block will run when the specified time elapses
      
      this.durationInSeconds= this.durationInSeconds+20
      
      this.patientser.upload_image(this.patient._id, uploadData,this.medicine).subscribe(
        (response) => {
          console.log(uploadData);
          this.durationInSeconds=  this.durationInSeconds+20
          // Handle the response from the server
          // Show a success message to the user
          this.notifier.notify('success','Files uploaded successfully');
          this.durationInSeconds= start-new Date().getTime();
          
          this.analyseFile()
        },
        (error) => {
          console.error('Error uploading files', error);
          // Handle the error
          // Show an error message to the user
          this.notifier.notify('error','Error uploading files. Please try again later.');
        }
      );
    }); // Calculate the remaining time
  }
  
  

  analyseFile(): void {
    this.patientser.get_analyse(this.patient._id).subscribe(
      (response: any) => {
        this.predictions = response; // Assign the response to predictions
        console.log(this.predictions);
        this.router.navigate(['navbar', 'analyse', this.patient._id], {
          state: { predictions: this.predictions ,user:this.patient}, // Pass predictions to the next route
        });
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  dropHandler(event: DragEvent): void {
    event.preventDefault();
    const files: FileList | null = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileInput(files);
    }
  }

  dragOverHandler(event: DragEvent): void {
    event.preventDefault();
  }
}
