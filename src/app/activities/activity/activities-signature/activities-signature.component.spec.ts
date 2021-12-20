import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitiesSignatureComponent } from './activities-signature.component';

describe('ActivitiesSignatureComponent', () => {
  let component: ActivitiesSignatureComponent;
  let fixture: ComponentFixture<ActivitiesSignatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivitiesSignatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivitiesSignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
