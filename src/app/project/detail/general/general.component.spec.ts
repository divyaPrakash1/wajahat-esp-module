import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GereralComponent } from './gereral.component';

describe('GereralComponent', () => {
  let component: GereralComponent;
  let fixture: ComponentFixture<GereralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GereralComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GereralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
