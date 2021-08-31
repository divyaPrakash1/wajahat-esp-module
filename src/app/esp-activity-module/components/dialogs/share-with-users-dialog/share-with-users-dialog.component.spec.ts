import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareWithUsersDialogComponent } from './share-with-users-dialog.component';

describe('ShareWithUsersDialogComponent', () => {
  let component: ShareWithUsersDialogComponent;
  let fixture: ComponentFixture<ShareWithUsersDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareWithUsersDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareWithUsersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
