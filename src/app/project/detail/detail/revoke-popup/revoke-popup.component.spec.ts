import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevokePopupComponent } from './revoke-popup.component';

describe('RevokePopupComponent', () => {
  let component: RevokePopupComponent;
  let fixture: ComponentFixture<RevokePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevokePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RevokePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
