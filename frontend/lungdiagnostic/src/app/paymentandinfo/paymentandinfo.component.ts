import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { loadStripe } from '@stripe/stripe-js';
@Component({
  selector: 'app-paymentandinfo',
  templateUrl: './paymentandinfo.component.html',
  styleUrls: ['./paymentandinfo.component.css']
})
export class PaymentandinfoComponent implements OnInit {
  private stripePromise: Promise<any>;
  private user_id:any;

  paymentHandler: any = null;
  constructor(private router: Router,private http: HttpClient,private route:ActivatedRoute) {
    this.stripePromise = loadStripe('pk_test_51NwiSaFrMgEVRHEifN4A2Cq1hz18gQHG6DD3NqPzwqyCgeyF9c9OJayieMyaeXzCHIgSZdC5OfYgFocZ41QgOQ4B00Z8AYigX2')
  }
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['data']) {
        // Parse the 'data' parameter (assuming it's a JSON string)
        const data = JSON.parse(params['data']);
        console.log(data);
        this.user_id = data._id
      }

    })
  }
  async pay(price: number,duration:any) {
    // Navigate to the "PurchaseComponent" route with a parameter (price)
    
      try {

      
        const response = await this.http.post<any>('http://127.0.0.1:8000/api/accounts/patient/payment/', { amount:price,user_id:this.user_id,duration:duration }).toPromise();
        
        if (response && response.session_id) {
          const stripe = await this.stripePromise;
          
          // Redirect to Stripe's hosted payment page
          await stripe.redirectToCheckout({
            sessionId: response.session_id,
          });
          
          return response.session_id;
        } else {
          throw new Error('Invalid response from the server.');
        }
      } catch (error) {
        // Handle errors appropriately
        console.error('Error creating Stripe Checkout Session:', error);
        throw error;
  };
  }
}
