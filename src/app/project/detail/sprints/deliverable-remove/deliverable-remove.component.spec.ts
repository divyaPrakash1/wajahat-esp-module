import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverableRemoveComponent } from './deliverable-remove.component';

describe('DeliverableRemoveComponent', () => {
  let component: DeliverableRemoveComponent;
  let fixture: ComponentFixture<DeliverableRemoveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliverableRemoveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliverableRemoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
