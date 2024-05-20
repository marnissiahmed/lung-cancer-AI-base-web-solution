import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatepageComponent } from './statepage.component';

describe('StatepageComponent', () => {
  let component: StatepageComponent;
  let fixture: ComponentFixture<StatepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatepageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
