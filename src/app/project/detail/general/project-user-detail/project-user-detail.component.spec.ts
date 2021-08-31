import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectUserDetailComponent } from './project-user-detail.component';

describe('ProjectUserDetailComponent', () => {
  let component: ProjectUserDetailComponent;
  let fixture: ComponentFixture<ProjectUserDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectUserDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectUserDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
