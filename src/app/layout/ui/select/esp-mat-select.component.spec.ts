import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EspMatSelectComponent } from './esp-mat-select.component';

describe('EspMatSelectComponent', () => {
  let component: EspMatSelectComponent;
  let fixture: ComponentFixture<EspMatSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EspMatSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EspMatSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
