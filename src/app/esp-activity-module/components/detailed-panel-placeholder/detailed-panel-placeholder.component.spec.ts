import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DetailedPanelPlaceholderComponent} from './detailed-panel-placeholder.component';

describe('DetailedPanelPlaceholderComponent', () => {
  let component: DetailedPanelPlaceholderComponent;
  let fixture: ComponentFixture<DetailedPanelPlaceholderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DetailedPanelPlaceholderComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailedPanelPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
