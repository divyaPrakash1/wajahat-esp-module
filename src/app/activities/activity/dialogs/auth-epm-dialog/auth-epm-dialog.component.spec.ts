import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthEpmDialogComponent } from './auth-epm-dialog.component';

describe('AuthEpmDialogComponent', () => {
  let component: AuthEpmDialogComponent;
  let fixture: ComponentFixture<AuthEpmDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthEpmDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthEpmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
