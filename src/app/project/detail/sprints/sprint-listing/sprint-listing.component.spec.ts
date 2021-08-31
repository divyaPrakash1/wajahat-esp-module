import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintListingComponent } from './sprint-listing.component';

describe('SprintListingComponent', () => {
  let component: SprintListingComponent;
  let fixture: ComponentFixture<SprintListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SprintListingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SprintListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
