import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ScheduleDueDateDialog } from "./schedule-due-date-dialog";

describe("ScheduleDueDateDialog", () => {
  let component: ScheduleDueDateDialog;
  let fixture: ComponentFixture<ScheduleDueDateDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduleDueDateDialog],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleDueDateDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
