import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ConfirmCreateDialog } from "./confirm-create-dialog";

describe("ConfirmCreateDialog", () => {
  let component: ConfirmCreateDialog;
  let fixture: ComponentFixture<ConfirmCreateDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmCreateDialog],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmCreateDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
