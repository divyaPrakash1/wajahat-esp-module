import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementDeletePopupComponent } from './requirement-delete-popup.component';

describe('RequirementDeletePopupComponent', () => {
  let component: RequirementDeletePopupComponent;
  let fixture: ComponentFixture<RequirementDeletePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementDeletePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementDeletePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
