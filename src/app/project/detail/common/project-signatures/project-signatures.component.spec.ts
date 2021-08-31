import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSignaturesComponent } from './project-signatures.component';

describe('ProjectSignaturesComponent', () => {
  let component: ProjectSignaturesComponent;
  let fixture: ComponentFixture<ProjectSignaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectSignaturesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectSignaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
