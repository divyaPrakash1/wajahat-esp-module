import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignedDialogComponent } from './signed-dialog.component';

describe('SignedDialogComponent', () => {
  let component: SignedDialogComponent;
  let fixture: ComponentFixture<SignedDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignedDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
