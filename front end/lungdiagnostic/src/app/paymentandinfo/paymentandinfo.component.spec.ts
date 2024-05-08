import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentandinfoComponent } from './paymentandinfo.component';

describe('PaymentandinfoComponent', () => {
  let component: PaymentandinfoComponent;
  let fixture: ComponentFixture<PaymentandinfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentandinfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentandinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
