import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitySearchFieldComponent } from './search-field-activity.component';

describe('ActivitySearchFieldComponent', () => {
  let component: ActivitySearchFieldComponent;
  let fixture: ComponentFixture<ActivitySearchFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivitySearchFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivitySearchFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
