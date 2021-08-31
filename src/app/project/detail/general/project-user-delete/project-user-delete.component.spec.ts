import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectUserDeleteComponent } from './project-user-delete.component';

describe('ProjectUserDeleteComponent', () => {
  let component: ProjectUserDeleteComponent;
  let fixture: ComponentFixture<ProjectUserDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectUserDeleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectUserDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
