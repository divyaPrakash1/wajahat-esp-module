import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowingActivitiesComponent } from './following-activities.component';

describe('FollowingActivitiesComponent', () => {
  let component: FollowingActivitiesComponent;
  let fixture: ComponentFixture<FollowingActivitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FollowingActivitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowingActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
