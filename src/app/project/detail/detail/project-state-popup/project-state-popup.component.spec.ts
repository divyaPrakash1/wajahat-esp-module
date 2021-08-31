import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectStatePopupComponent } from './project-state-popup.component';

describe('ProjectStatePopupComponent', () => {
  let component: ProjectStatePopupComponent;
  let fixture: ComponentFixture<ProjectStatePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectStatePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectStatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
