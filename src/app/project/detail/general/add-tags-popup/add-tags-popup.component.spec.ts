import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTagsPopupComponent } from './add-tags-popup.component';

describe('AddTagsPopupComponent', () => {
  let component: AddTagsPopupComponent;
  let fixture: ComponentFixture<AddTagsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTagsPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTagsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
