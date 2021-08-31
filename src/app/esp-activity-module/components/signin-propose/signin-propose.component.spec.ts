import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SigninProposeComponent } from './signin-propose.component';

describe('SigninProposeComponent', () => {
  let component: SigninProposeComponent;
  let fixture: ComponentFixture<SigninProposeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SigninProposeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigninProposeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
