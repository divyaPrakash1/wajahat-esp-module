import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintDeleteComponent } from './sprint-delete.component';

describe('SprintDeleteComponent', () => {
  let component: SprintDeleteComponent;
  let fixture: ComponentFixture<SprintDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SprintDeleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SprintDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
