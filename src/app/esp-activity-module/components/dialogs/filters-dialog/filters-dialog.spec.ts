import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { FiltersDialog } from "./filters-dialog";

describe("FiltersDialog", () => {
  let component: FiltersDialog;
  let fixture: ComponentFixture<FiltersDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FiltersDialog],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiltersDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
