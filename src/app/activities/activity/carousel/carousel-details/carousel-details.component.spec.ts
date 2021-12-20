import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselDetailsComponent } from './carousel-details.component';

describe('CarouselDetailsComponent', () => {
  let component: CarouselDetailsComponent;
  let fixture: ComponentFixture<CarouselDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarouselDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarouselDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
