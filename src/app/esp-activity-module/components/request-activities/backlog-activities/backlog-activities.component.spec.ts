import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BacklogActivitiesComponent } from './backlog-activities.component';

describe('BacklogActivitiesComponent', () => {
  let component: BacklogActivitiesComponent;
  let fixture: ComponentFixture<BacklogActivitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BacklogActivitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BacklogActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
