import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EpmSettingsDialogComponent } from './epm-settings-dialog.component';

describe('EpmSettingsDialogComponent', () => {
  let component: EpmSettingsDialogComponent;
  let fixture: ComponentFixture<EpmSettingsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EpmSettingsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EpmSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
