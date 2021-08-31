import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementTagsPopupComponent } from './requirement-tags-popup.component';

describe('RequirementTagsPopupComponent', () => {
  let component: RequirementTagsPopupComponent;
  let fixture: ComponentFixture<RequirementTagsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementTagsPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementTagsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
