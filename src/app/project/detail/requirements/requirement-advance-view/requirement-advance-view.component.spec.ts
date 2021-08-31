import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementAdvanceViewComponent } from './requirement-advance-view.component';

describe('RequirementAdvanceViewComponent', () => {
  let component: RequirementAdvanceViewComponent;
  let fixture: ComponentFixture<RequirementAdvanceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementAdvanceViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementAdvanceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
