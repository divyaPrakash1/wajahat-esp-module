import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CloseDialog } from "./close-dialog";

describe("CloseDialog", () => {
  let component: CloseDialog;
  let fixture: ComponentFixture<CloseDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CloseDialog],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
