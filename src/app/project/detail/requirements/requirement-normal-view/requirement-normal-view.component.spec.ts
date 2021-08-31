import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementNormalViewComponent } from './requirement-normal-view.component';

describe('RequirementNormalViewComponent', () => {
  let component: RequirementNormalViewComponent;
  let fixture: ComponentFixture<RequirementNormalViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementNormalViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementNormalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
