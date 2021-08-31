import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestActivitiesMainComponent } from './request-activities-main.component';

describe('RequestActivitiesMainComponent', () => {
  let component: RequestActivitiesMainComponent;
  let fixture: ComponentFixture<RequestActivitiesMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestActivitiesMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestActivitiesMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
