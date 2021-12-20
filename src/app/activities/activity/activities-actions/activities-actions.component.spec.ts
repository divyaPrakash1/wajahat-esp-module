import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitiesActionsComponent } from './activities-actions.component';

describe('ActivitiesActionsComponent', () => {
  let component: ActivitiesActionsComponent;
  let fixture: ComponentFixture<ActivitiesActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivitiesActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivitiesActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
