import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowedUserDetailsComponent } from './followed-user-details.component';

describe('FollowedUserDetailsComponent', () => {
  let component: FollowedUserDetailsComponent;
  let fixture: ComponentFixture<FollowedUserDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FollowedUserDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowedUserDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
