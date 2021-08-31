import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintCloseRequestComponent } from './sprint-close-request.component';

describe('SprintCloseRequestComponent', () => {
  let component: SprintCloseRequestComponent;
  let fixture: ComponentFixture<SprintCloseRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SprintCloseRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SprintCloseRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
