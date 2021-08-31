import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintGirdViewComponent } from './sprint-gird-view.component';

describe('SprintGirdViewComponent', () => {
  let component: SprintGirdViewComponent;
  let fixture: ComponentFixture<SprintGirdViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SprintGirdViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SprintGirdViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
