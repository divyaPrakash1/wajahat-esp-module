import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosedActivitiesComponent } from './closed-activities.component';

describe('ClosedActivitiesComponent', () => {
  let component: ClosedActivitiesComponent;
  let fixture: ComponentFixture<ClosedActivitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClosedActivitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClosedActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
