import { Component, OnInit, AfterViewInit,Input, Output, EventEmitter } from '@angular/core';
import { MessageService } from '../services/message.service';
import { MedicineService } from '../services/medicine.service';
import { Subscription } from 'rxjs';
import { User } from '../shared/medicine_model';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit {
  @Input() isChatVisible: boolean;
  @Input() id: string;
  
  @Output() isChatVisibleChange = new EventEmitter<boolean>();
message:any[] = [];
sendedmessage:any[] =[];
messageInput: string = '';
  constructor(private messageserve :MessageService,private medicineserver:MedicineService) { }
  medicine:User;
  stat:any;
  sub: Subscription;
  ngOnInit(): void {
    this.sub = this.medicineserver.user.subscribe(
      (data: User) => {
        this.medicine = data
       
      })
    this.messageserve.initWebSocket(this.medicine.id)
    this.messageserve.getNotifications().subscribe((data)=> {
      this.message.push(data);
      console.log("notfication",data)})
  }
  sendmessage(){
    
    if (this.messageInput.trim() !== '') {
      const msg = {
      
        message:this.messageInput,
       
      }
      this.messageserve.sendMessage({ message: msg, _id :this.id });
      // Clear the input field after sending
    }
    this.messageInput = '';
}
close(){
  this.isChatVisible = false;
}
}
