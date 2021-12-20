import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MineActivitiesComponent } from './mine-activities.component';

describe('MineActivitiesComponent', () => {
  let component: MineActivitiesComponent;
  let fixture: ComponentFixture<MineActivitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MineActivitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MineActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
