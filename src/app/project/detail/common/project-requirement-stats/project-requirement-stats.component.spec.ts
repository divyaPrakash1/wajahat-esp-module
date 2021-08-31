import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectRequirementStatsComponent } from './project-requirement-stats.component';

describe('ProjectRequirementStatsComponent', () => {
  let component: ProjectRequirementStatsComponent;
  let fixture: ComponentFixture<ProjectRequirementStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectRequirementStatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectRequirementStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
