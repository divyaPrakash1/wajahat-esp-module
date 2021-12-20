import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekGraphComponent } from './week-graph.component';

describe('WeekGraphComponent', () => {
  let component: WeekGraphComponent;
  let fixture: ComponentFixture<WeekGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
