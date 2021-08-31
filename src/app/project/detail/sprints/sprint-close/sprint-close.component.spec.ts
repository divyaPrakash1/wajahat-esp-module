import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintCloseComponent } from './sprint-close.component';

describe('SprintCloseComponent', () => {
  let component: SprintCloseComponent;
  let fixture: ComponentFixture<SprintCloseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SprintCloseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SprintCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
