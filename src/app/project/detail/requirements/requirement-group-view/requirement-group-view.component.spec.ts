import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementGroupViewComponent } from './requirement-group-view.component';

describe('RequirementGroupViewComponent', () => {
  let component: RequirementGroupViewComponent;
  let fixture: ComponentFixture<RequirementGroupViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementGroupViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementGroupViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
