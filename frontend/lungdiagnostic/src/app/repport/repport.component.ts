import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { NotifierService } from 'angular-notifier';
import { MedicineService } from '../services/medicine.service';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { User } from '../shared/medicine_model';
import { Subscription } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
@Component({
  selector: 'app-repport',
  templateUrl: './repport.component.html',
  styleUrls: ['./repport.component.css']
})
export class RepportComponent implements OnInit {
  @ViewChild('signatureCanvas', { static: true }) sigCanvas: ElementRef;
  private context: CanvasRenderingContext2D;
  private drawing: boolean = false;
  private lastPos: { x: number, y: number } = { x: 0, y: 0 }
  dataurl:SafeUrl;
  private isDrawing: boolean = false;
  patient:any;
  nodules:SafeUrl[] = [];
  impression:string;
  nod:string;
  medicine:User;
  sub: Subscription;
  _id:any;
  textConversionEnabled = false;
  private readonly notifier: NotifierService;
  constructor(private sanitizer: DomSanitizer,private med:MedicineService,private http: HttpClient, notifier:NotifierService,) {
    this.notifier = notifier;
   }

  ngOnInit(): void {
    this.patient = history.state.user;
    this.nod = history.state.nodule;
    this._id = history.state.analyse;
    this.sub = this.med.user.subscribe(
      (data: User) => {
        this.medicine = data
       
      })
      if (this.nod && typeof this.nod === 'string') {
    const imageList = this.nod.split("', '")

        for (const imageData of imageList) {
           
          const imageUrl = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + imageData);
          
          this.nodules.push(imageUrl);
        }
              }
  }
   generateHTMLBlob() {
    // Get the container element and style tags
    const container = document.getElementById('container');
    const styleTags = document.querySelectorAll('repport.component');
    let css = '';
    styleTags.forEach((styleTag) => {
      css += styleTag.textContent;
    });
  
    const containerHtml = container.innerHTML;
    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
        body {
          margin: 20%;
          display: flex;
          width: 50%;
          height: 50%;
          flex-direction: column;
          background-color: aliceblue;
          width: 60%;
      }
      
      .report-title {
          align-self: flex-start;
      }
      
      .patient-info {
          align-self: flex-end;
      }
      
      .horizontal-line {
          width: 100%;
          border-top: 1px solid #000;
      }
      
      .ct-findings {
          display: flex;
          align-items: center;
      }
      
      .ct-finding {
          flex: 1;
          margin-right: 20px;
      }
      
      .nodule-image {
          width: 150px;
          height: 150px;
          /* Adjust as needed */
      }
      
      .form-group {
          margin: 10px 0;
      }
      
      .signatureCanvas {
          border: 2px dotted #CCCCCC;
          border-radius: 15px;
          cursor: crosshair;
      }
      
      .signatureImage {
          width: 100px;
          height: 100px;
          border: #000;
      }
        </style>
      </head>
      <body>
        ${containerHtml}
      </body>
    </html>
  `;
  
  
    // Create a Blob from the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
  
    return blob;
  }
  
  
  
  ngAfterViewInit(): void {
    this.context = this.sigCanvas.nativeElement.getContext('2d');
    this.context.strokeStyle = '#222222';
    this.context.lineWidth = 4;

    this.sigCanvas.nativeElement.addEventListener('mousedown', this.startDrawing.bind(this), false);
    this.sigCanvas.nativeElement.addEventListener('mouseup', this.endDrawing.bind(this), false);
    this.sigCanvas.nativeElement.addEventListener('mousemove', this.draw.bind(this), false);
    // Add touch event listeners for mobile devices (not shown in this code, but you can adapt the provided JavaScript code for touch events).
  }

  startDrawing(event: MouseEvent): void {
    this.drawing = true;
    this.lastPos = this.getMousePos(this.sigCanvas.nativeElement, event);
  }

  endDrawing(): void {
    this.drawing = false;
  }

  draw(event: MouseEvent): void {
    if (!this.drawing) return;
    this.context.beginPath();
    this.context.moveTo(this.lastPos.x, this.lastPos.y);
    const currentPos = this.getMousePos(this.sigCanvas.nativeElement, event);
    this.context.lineTo(currentPos.x, currentPos.y);
    this.context.stroke();
    this.lastPos = currentPos;
  }

  getMousePos(canvasDom: HTMLCanvasElement, mouseEvent: MouseEvent): { x: number, y: number } {
    const rect = canvasDom.getBoundingClientRect();
    return {
      x: mouseEvent.clientX - rect.left,
      y: mouseEvent.clientY - rect.top
    };
  }

  clearSignature(): void {
    this.context.clearRect(0, 0, this.sigCanvas.nativeElement.width, this.sigCanvas.nativeElement.height);
  }

  saveSignature(): void {
    this.textConversionEnabled = !this.textConversionEnabled;
     this.dataurl = this.sigCanvas.nativeElement.toDataURL();
     this.sigCanvas.nativeElement.remove();
    // Handle the dataUrl as needed (e.g., send it to the backend).
    console.log('Signature Data URL:', this.dataurl);
  }

  async submitReport() {
    
    const pdf = await this.generateHTMLBlob(); // Generate the PDF

    // Create a Blob from the PDF data
    ;

    // Create a FormData to send the PDF to the server
    const formData = new FormData();
    formData.append('pdf_report', pdf, 'report.html');
    formData.append('analyse', this._id);

    // Send the FormData to the server
    let params = new HttpParams()
    .set('meidcine',this.medicine.id)
    this.http.post('http://127.0.0.1:8000/api/accounts/patient/Report/', formData,{ params: params }).subscribe((data) => {
      this.notifier.notify('success','report add successfully');
      console.log(data);
    },(error) => {
      
      // Show an error message to the user
      this.notifier.notify('error',error);
    }
    );
  }

}
