import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementClosePopupComponent } from './requirement-close-popup.component';

describe('RequirementClosePopupComponent', () => {
  let component: RequirementClosePopupComponent;
  let fixture: ComponentFixture<RequirementClosePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementClosePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementClosePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
