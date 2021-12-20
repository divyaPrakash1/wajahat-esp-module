import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import { ActivityAlertComponent } from './alert-activity.component';


describe('ActivityAlertComponent', () => {
  let component: ActivityAlertComponent;
  let fixture: ComponentFixture<ActivityAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActivityAlertComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
