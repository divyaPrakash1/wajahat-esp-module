import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementListViewComponent } from './requirement-list-view.component';

describe('RequirementListViewComponent', () => {
  let component: RequirementListViewComponent;
  let fixture: ComponentFixture<RequirementListViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementListViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
