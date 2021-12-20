import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitiesGroupComponent } from './activities-group.component';

describe('ActivitiesGroupComponent', () => {
  let component: ActivitiesGroupComponent;
  let fixture: ComponentFixture<ActivitiesGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivitiesGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivitiesGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
