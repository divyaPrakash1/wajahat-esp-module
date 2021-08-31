import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementDetailViewComponent } from './requirement-detail-view.component';

describe('RequirementDetailViewComponent', () => {
  let component: RequirementDetailViewComponent;
  let fixture: ComponentFixture<RequirementDetailViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementDetailViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
