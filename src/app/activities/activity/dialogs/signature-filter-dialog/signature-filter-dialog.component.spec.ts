import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureFilterDialogComponent } from './signature-filter-dialog.component';

describe('SignatureFilterDialogComponent', () => {
  let component: SignatureFilterDialogComponent;
  let fixture: ComponentFixture<SignatureFilterDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignatureFilterDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignatureFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
