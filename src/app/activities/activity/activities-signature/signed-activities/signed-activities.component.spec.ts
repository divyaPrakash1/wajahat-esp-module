import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignedActivitiesComponent } from './signed-activities.component';

describe('SignedActivitiesComponent', () => {
  let component: SignedActivitiesComponent;
  let fixture: ComponentFixture<SignedActivitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignedActivitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignedActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
