import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTreatmentPlanComponent } from './create-treatment-plan.component';

describe('CreateTreatmentPlanComponent', () => {
  let component: CreateTreatmentPlanComponent;
  let fixture: ComponentFixture<CreateTreatmentPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTreatmentPlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTreatmentPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
