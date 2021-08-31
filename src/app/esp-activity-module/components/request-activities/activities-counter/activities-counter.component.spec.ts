import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitiesCounterComponent } from './activities-counter.component';

describe('ActivitiesCounterComponent', () => {
  let component: ActivitiesCounterComponent;
  let fixture: ComponentFixture<ActivitiesCounterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivitiesCounterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivitiesCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
