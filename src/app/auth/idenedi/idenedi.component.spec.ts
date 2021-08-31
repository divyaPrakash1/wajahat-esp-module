import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdenediComponent } from './idenedi.component';

describe('IdenediComponent', () => {
  let component: IdenediComponent;
  let fixture: ComponentFixture<IdenediComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdenediComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdenediComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
