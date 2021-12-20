import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectMultipleDialogComponent } from './reject-multiple-dialog.component';

describe('RejectMultipleDialogComponent', () => {
  let component: RejectMultipleDialogComponent;
  let fixture: ComponentFixture<RejectMultipleDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectMultipleDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectMultipleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
