import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedActivitiesComponent } from './shared-activities.component';

describe('SharedActivitiesComponent', () => {
  let component: SharedActivitiesComponent;
  let fixture: ComponentFixture<SharedActivitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedActivitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
