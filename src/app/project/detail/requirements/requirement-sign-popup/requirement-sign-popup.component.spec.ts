import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementSignPopupComponent } from './requirement-sign-popup.component';

describe('RequirementSignPopupComponent', () => {
  let component: RequirementSignPopupComponent;
  let fixture: ComponentFixture<RequirementSignPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementSignPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementSignPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
