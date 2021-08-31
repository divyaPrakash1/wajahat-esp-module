import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectUserListingComponent } from './project-user-listing.component';

describe('ProjectUserListingComponent', () => {
  let component: ProjectUserListingComponent;
  let fixture: ComponentFixture<ProjectUserListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectUserListingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectUserListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
