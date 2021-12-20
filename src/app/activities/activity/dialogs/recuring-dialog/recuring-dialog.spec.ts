import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecuringDialog } from './recuring-dialog';

describe('RecuringDialog', () => {
  let component: RecuringDialog;
  let fixture: ComponentFixture<RecuringDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecuringDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecuringDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
