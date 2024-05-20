import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse,HttpParams  } from '@angular/common/http';
import { singupModel,AuthResData,loginModel,User } from "src/app/shared/medicine_model";
import { catchError,tap} from 'rxjs/operators';
import { BehaviorSubject, throwError } from "rxjs";
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Router } from "@angular/router";
import { FormGroup } from '@angular/forms';
@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private socket: WebSocketSubject<any>;
  user = new BehaviorSubject<User>(null);
  private serverUrl ='http://127.0.0.1:8000/api/accounts/'; 
  constructor(private http: HttpClient,private router: Router,){
   
  }

  signup(account: singupModel){
      
      return this.http.post<AuthResData>('http://127.0.0.1:8000/api/accounts/signup/',account)
      .pipe(catchError(this.handleError),tap((res)=>{
        this.handleAuth(res);
      }))
    
  
  }
  createMedicineManager(data: any) {
    return this.http.post('http://127.0.0.1:8000/api/accounts/manager/', data);
  }

  login(account: loginModel){
      return this.http.post<AuthResData>('http://127.0.0.1:8000/api/accounts/login/',account)
      .pipe(catchError(this.handleError),tap((res)=>{
        console.log(res)
          this.handleAuth(res);
      }))
  }

  autologin() {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      const loadedUser = new User(userData.id,userData.email, userData.phone_number, userData.name, userData.token,userData.occupation,userData.is_superuser,userData.manager,userData.photo)
      this.user.next(loadedUser);
      return loadedUser;
    } else {
      return null;
    }
  }

  private handleError(error: HttpErrorResponse){
      console.log(error)
      let errormessage = 'An unknown errror occured'
      if(!error.error){
          return throwError(errormessage)
      }
      if(error.error.non_field_errors){
          errormessage = error.error.non_field_errors[0]
      }
      if(error.error.email){
          errormessage = error.error.email[0]
      }
      if(error.error.username){
          errormessage = error.error.username[0]
      }
      return throwError(errormessage);
  }

  private handleAuth(res: AuthResData){
      const user = new User(res._id,res.email,res.phone_number,res.name,res.token,res.occupation,res.is_superuser,res.manager,res.photo);
      this.user.next(user);
      localStorage.setItem('user',JSON.stringify(user))
  }
  logout(){
      this.user.next(null)
      localStorage.removeItem('user');
      this.socket.complete()
      this.router.navigate(['/login'])

  }
  getOrganization(){
    return this.http.get<any>('http://127.0.0.1:8000/api/accounts/superuser/medicines/')
  }
 
  connectToWebSocket(userId: any) {
    this.socket = webSocket(`ws://localhost:8000/ws/notification/${userId}/`);
  }
getNotifications() {
 
    return this.socket.asObservable();
  }
  sendMessage(message) {
    this.socket.next(message);
  }

getcontact(manager_id){
  const url = `${this.serverUrl}contact/?medicine_id=${manager_id}`;
  return this.http.get(url);
}
}