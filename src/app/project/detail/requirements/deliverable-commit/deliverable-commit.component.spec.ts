import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverableCommitComponent } from './deliverable-commit.component';

describe('DeliverableCommitComponent', () => {
  let component: DeliverableCommitComponent;
  let fixture: ComponentFixture<DeliverableCommitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliverableCommitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliverableCommitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
