import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { LogDialog } from "./log-dialog";

describe("LogDialog", () => {
  let component: LogDialog;
  let fixture: ComponentFixture<LogDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LogDialog],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
