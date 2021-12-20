import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringResultDialog } from './recurring-result-dialog';

describe('RecurringResultDialog', () => {
  let component: RecurringResultDialog;
  let fixture: ComponentFixture<RecurringResultDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringResultDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringResultDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
