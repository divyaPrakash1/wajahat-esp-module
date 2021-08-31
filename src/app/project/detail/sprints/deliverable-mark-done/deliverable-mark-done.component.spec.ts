import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverableMarkDoneComponent } from './deliverable-mark-done.component';

describe('DeliverableMarkDoneComponent', () => {
  let component: DeliverableMarkDoneComponent;
  let fixture: ComponentFixture<DeliverableMarkDoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliverableMarkDoneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliverableMarkDoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
