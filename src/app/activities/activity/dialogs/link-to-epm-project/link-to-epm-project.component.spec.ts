import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkToEpmProjectComponent } from './link-to-epm-project.component';

describe('LinkToEpmProjectComponent', () => {
  let component: LinkToEpmProjectComponent;
  let fixture: ComponentFixture<LinkToEpmProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkToEpmProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkToEpmProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
