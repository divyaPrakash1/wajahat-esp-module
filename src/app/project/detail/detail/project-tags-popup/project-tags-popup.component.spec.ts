import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTagsPopupComponent } from './project-tags-popup.component';

describe('ProjectTagsPopupComponent', () => {
  let component: ProjectTagsPopupComponent;
  let fixture: ComponentFixture<ProjectTagsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectTagsPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectTagsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
