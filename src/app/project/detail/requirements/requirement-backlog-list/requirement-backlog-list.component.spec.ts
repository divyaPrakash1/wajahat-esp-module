import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementBacklogListComponent } from './requirement-backlog-list.component';

describe('RequirementBacklogListComponent', () => {
  let component: RequirementBacklogListComponent;
  let fixture: ComponentFixture<RequirementBacklogListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementBacklogListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementBacklogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
