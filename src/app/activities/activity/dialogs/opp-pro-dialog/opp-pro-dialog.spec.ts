import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { OppProDialog } from "./opp-pro-dialog";

describe("OppProDialog", () => {
  let component: OppProDialog;
  let fixture: ComponentFixture<OppProDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OppProDialog],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OppProDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
