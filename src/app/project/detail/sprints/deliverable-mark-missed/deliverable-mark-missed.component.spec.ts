import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverableMarkMissedComponent } from './deliverable-mark-missed.component';

describe('DeliverableMarkMissedComponent', () => {
  let component: DeliverableMarkMissedComponent;
  let fixture: ComponentFixture<DeliverableMarkMissedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliverableMarkMissedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliverableMarkMissedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
