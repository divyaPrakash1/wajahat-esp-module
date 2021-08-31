import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InnerDetailComponent } from './inner-detail.component';

describe('InnerDetailComponent', () => {
  let component: InnerDetailComponent;
  let fixture: ComponentFixture<InnerDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InnerDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InnerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
