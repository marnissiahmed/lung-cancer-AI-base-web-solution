import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraitmentDetaisComponent } from './traitment-detais.component';

describe('TraitmentDetaisComponent', () => {
  let component: TraitmentDetaisComponent;
  let fixture: ComponentFixture<TraitmentDetaisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TraitmentDetaisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TraitmentDetaisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
