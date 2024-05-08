import { Component, OnInit,Injectable  } from '@angular/core';
import { AuthResData } from '../shared/medicine_model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {  Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotifierService } from 'angular-notifier';
import { MedicineService } from '../services/medicine.service';

const baseUrl='http://127.0.0.1:8000/'
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
@Injectable({
  providedIn: 'root'
})

export class LoginComponent implements OnInit {

  isLoginMode = true;
  signupForm: FormGroup;
  loginForm: FormGroup;
  token: string;
  error:string=null;
  success:string=null;
  showPassword = false;
  orga:any;
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  private readonly notifier: NotifierService;

constructor(private snackBar: MatSnackBar,
  private router:Router,private medicine: MedicineService, notifier:NotifierService) {
    this.notifier = notifier;
   }
   is_superuser:boolean;

  ngOnInit() {
    this.is_superuser = history.state.is_superuser;
    this.medicine.getOrganization().subscribe((data)=>
    {
      this.orga =  data.filter(item => item.is_superuser === true);
    })
    if(this.is_superuser===false){
    this.signupForm = new FormGroup({
      'phone_number': new FormControl(null, Validators.required),
      'name': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'occupation': new FormControl(null, Validators.required), // Add occupation field
      'organization': new FormControl(null, Validators.required),
      'passwords': new FormGroup({
        'password': new FormControl(null, [Validators.required, Validators.minLength(4)]),
        'confirmpassword': new FormControl(null, [Validators.required, Validators.minLength(4)])
      }, this.passwordCheck)
    });
  }
  else{
    this.signupForm = new FormGroup({
      'phone_number': new FormControl(null, Validators.required),
      'name': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'passwords': new FormGroup({
        'password': new FormControl(null, [Validators.required, Validators.minLength(4)]),
        'confirmpassword': new FormControl(null, [Validators.required, Validators.minLength(4)])
      }, this.passwordCheck)
    });
  }
    this.loginForm = new FormGroup({
      'email': new FormControl(null,[Validators.required,Validators.email]),
      'password': new FormControl(null,[Validators.required,Validators.minLength(4)])
    })
  }
  onSignup(){
    if (this.is_superuser===false){

    console.log(this.signupForm)
    this.medicine.signup({
      'phone_number': this.signupForm.get('phone_number').value,
      'email': this.signupForm.get('email').value,
      'name': this.signupForm.get('name').value,
      'password': this.signupForm.get('passwords.password').value,
    "occupation":this.signupForm.get("occupation").value,
    'is_superuser':this.is_superuser,
    'manager':this.signupForm.get('organization').value,

  })
    .subscribe(
      (data: AuthResData) => {
        this.isLoginMode = true;
        
        
        this.router.navigate([''],{queryParams:data})
        this.notifier.notify('success', 'Signup was successfull')

        this.error = null;
      },(errorRes)=>{
        console.log(errorRes)
        this.notifier.notify('error',  'account alredy exist try to login')
      }
    )
    }
    else{
      const dataform = {
      'phone_number': this.signupForm.get('phone_number').value,
      'email': this.signupForm.get('email').value,
      'name': this.signupForm.get('name').value,
      'password': this.signupForm.get('passwords.password').value,
      'occupation':'admin',
      'is_superuser':this.is_superuser,
      'manager':'false',
      }
      this.medicine.signup(dataform).subscribe(
        (data) => {
          console.log(data);
      
          // Convert the data to a string if needed
          const queryParams = { data: JSON.stringify(data) };
      
          this.router.navigate(['/payment'], { queryParams });
          this.notifier.notify('success', 'Signup was successful');
        },
        (error) => {
          console.log(error);
          this.notifier.notify('error', 'Account already exists. Try to login.');
        }
      );

    }
  }
  

  
  onLogin(){
    this.medicine.login(this.loginForm.value)
    .subscribe(
      (data: AuthResData) => {
        this.token = data.token
        console.log(data)
       
        if (data.is_subscribed) {
          // User is subscribed, navigate to the navbar page
          this.notifier.notify('success', 'wellcome to lungcare AI solution.')
          this.router.navigate(['/navbar']);
          
        } else {
          // User is not subscribed, redirect to the payment page
          this.notifier.notify('success', 'subscription end')
          const queryParams = { data: JSON.stringify(data) };
      
          this.router.navigate(['/payment'], { queryParams });
         
        }
      },(errorRes)=>{
        console.log(errorRes)
        this.notifier.notify('error',errorRes)
      }
    )
    this.loginForm.reset()

  }

  passwordCheck(control: FormGroup): {[s:string]:boolean}{
    if(control.get('password').value != control.get('confirmpassword').value){
      return {'notsame': true}
    }
    return null;
  }
}