import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectSettingPopupComponent } from './project-setting-popup.component';


describe('ProjectDeletePopupComponent', () => {
  let component: ProjectSettingPopupComponent;
  let fixture: ComponentFixture<ProjectSettingPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectSettingPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectSettingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
