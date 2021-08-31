import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentDeletePopupComponent } from './attachment-delete-popup.component';

describe('AttachmentDeletePopupComponent', () => {
  let component: AttachmentDeletePopupComponent;
  let fixture: ComponentFixture<AttachmentDeletePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttachmentDeletePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentDeletePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
