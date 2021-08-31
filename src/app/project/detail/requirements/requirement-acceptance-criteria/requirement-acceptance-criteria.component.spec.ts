import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementAcceptanceCriteriaComponent } from './requirement-acceptance-criteria.component';

describe('RequirementAcceptanceCriteriaComponent', () => {
  let component: RequirementAcceptanceCriteriaComponent;
  let fixture: ComponentFixture<RequirementAcceptanceCriteriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementAcceptanceCriteriaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementAcceptanceCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
