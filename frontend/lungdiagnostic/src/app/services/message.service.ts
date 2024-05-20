import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private socketUrl = 'ws://localhost:8000/ws/message/'; // Replace with your WebSocket server URL

  public socket$: WebSocketSubject<any>;
  messageInput: string = '';
  constructor() {
    
  }

  initWebSocket(id:any) {
    this.socket$ = new WebSocketSubject(`${this.socketUrl+id}/`);
  }

  sendMessage(message: any) {
    // Send a message to the WebSocket server
    this.socket$.next(message);
  }
  getNotifications() {
 
    return this.socket$.asObservable();
  }
}