import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ConfirmCloseDialog } from "./confirm-close-dialog";

describe("ConfirmCloseDialog", () => {
  let component: ConfirmCloseDialog;
  let fixture: ComponentFixture<ConfirmCloseDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmCloseDialog],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmCloseDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
