import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectedActivitiesComponent } from './rejected-activities.component';

describe('RejectedActivitiesComponent', () => {
  let component: RejectedActivitiesComponent;
  let fixture: ComponentFixture<RejectedActivitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectedActivitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectedActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
