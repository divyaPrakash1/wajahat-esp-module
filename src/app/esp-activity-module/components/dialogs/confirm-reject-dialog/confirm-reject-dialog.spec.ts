import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ConfirmRejectDialog } from "./confirm-reject-dialog";

describe("ConfirmRejectDialog", () => {
  let component: ConfirmRejectDialog;
  let fixture: ComponentFixture<ConfirmRejectDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmRejectDialog],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmRejectDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
