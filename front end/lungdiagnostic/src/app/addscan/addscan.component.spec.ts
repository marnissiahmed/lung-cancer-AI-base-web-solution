import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddscanComponent } from './addscan.component';

describe('AddscanComponent', () => {
  let component: AddscanComponent;
  let fixture: ComponentFixture<AddscanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddscanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddscanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
