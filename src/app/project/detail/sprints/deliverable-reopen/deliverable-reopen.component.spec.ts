import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverableReopenComponent } from './deliverable-reopen.component';

describe('DeliverableReopenComponent', () => {
  let component: DeliverableReopenComponent;
  let fixture: ComponentFixture<DeliverableReopenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliverableReopenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliverableReopenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
