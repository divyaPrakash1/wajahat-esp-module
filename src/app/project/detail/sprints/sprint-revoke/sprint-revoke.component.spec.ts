import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintRevokeComponent } from './sprint-revoke.component';

describe('SprintRevokeComponent', () => {
  let component: SprintRevokeComponent;
  let fixture: ComponentFixture<SprintRevokeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SprintRevokeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SprintRevokeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
