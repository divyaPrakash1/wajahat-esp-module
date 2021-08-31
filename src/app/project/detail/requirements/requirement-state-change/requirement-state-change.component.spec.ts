import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementStateChangeComponent } from './requirement-state-change.component';

describe('RequirementStateChangeComponent', () => {
  let component: RequirementStateChangeComponent;
  let fixture: ComponentFixture<RequirementStateChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementStateChangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementStateChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
