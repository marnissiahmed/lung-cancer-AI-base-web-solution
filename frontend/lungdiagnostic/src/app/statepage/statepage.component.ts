import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-statepage',
  templateUrl: './statepage.component.html',
  styleUrls: ['./statepage.component.css']
})
export class StatepageComponent implements OnInit {

  constructor(private router:Router) { }

  ngOnInit(): void {
  }
  Sign(is_superuser:boolean){

    this.router.navigateByUrl('/login',{ state: {is_superuser} })
  }

}
