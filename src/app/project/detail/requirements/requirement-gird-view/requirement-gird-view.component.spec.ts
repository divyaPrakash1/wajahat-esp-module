import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementGirdViewComponent } from './requirement-gird-view.component';

describe('RequirementGirdViewComponent', () => {
  let component: RequirementGirdViewComponent;
  let fixture: ComponentFixture<RequirementGirdViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementGirdViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementGirdViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
