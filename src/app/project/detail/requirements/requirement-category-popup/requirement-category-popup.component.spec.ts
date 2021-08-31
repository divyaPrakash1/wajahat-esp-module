import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementCategoryPopupComponent } from './requirement-category-popup.component';

describe('RequirementCategoryPopupComponent', () => {
  let component: RequirementCategoryPopupComponent;
  let fixture: ComponentFixture<RequirementCategoryPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementCategoryPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementCategoryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
