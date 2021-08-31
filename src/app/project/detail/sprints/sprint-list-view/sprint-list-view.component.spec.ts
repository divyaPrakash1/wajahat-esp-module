import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintListViewComponent } from './sprint-list-view.component';

describe('SprintListViewComponent', () => {
  let component: SprintListViewComponent;
  let fixture: ComponentFixture<SprintListViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SprintListViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SprintListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
