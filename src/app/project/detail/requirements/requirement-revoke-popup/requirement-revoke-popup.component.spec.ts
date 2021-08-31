import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementRevokePopupComponent } from './requirement-revoke-popup.component';

describe('RequirementRevokePopupComponent', () => {
  let component: RequirementRevokePopupComponent;
  let fixture: ComponentFixture<RequirementRevokePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementRevokePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementRevokePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
