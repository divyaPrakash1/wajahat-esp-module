import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintSignComponent } from './sprint-sign.component';

describe('SprintSignComponent', () => {
  let component: SprintSignComponent;
  let fixture: ComponentFixture<SprintSignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SprintSignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SprintSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
