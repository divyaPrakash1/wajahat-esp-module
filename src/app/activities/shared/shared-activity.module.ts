import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
// import { ShareLinkDialogComponent } from "./modals/share-link-dialog/share-link-dialog.component";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatMenuModule } from "@angular/material/menu";
import { FormsModule } from "@angular/forms";
import {MatTreeModule} from '@angular/material/tree';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
// import { SigninProposeComponent } from "./modals/signin-propose/signin-propose/signin-propose.component";
import { RouterModule } from "@angular/router";
// import { SignInProposeService } from "./modals/signin-propose/signin-propose.service";
// import { SearchFieldComponent } from "./components/search-field/search-field.component";
// import { BreadcrumbsComponent } from "./components/breadcrumbs/breadcrumbs.component";
// import { SizeDetectorComponent } from "./components/screen-size-detector/size-detector.component";
// import { LoadingComponent } from "./components/loading/loading.component";
// import { ClickOutsideDirective } from "./directives/click-outside.directive";
// import { LastDirective } from "./directives/is-last.directive";
import { MatSnackBar } from "@angular/material/snack-bar";
// import { BackBtnComponent } from "./components/buttons/back-btn/back-btn.component";
// import { SocialLinksComponent } from "./components/social-links/social-links.component";
// import { SocialShareListComponent } from "./components/social-share-list/social-share-list.component";
// import { SocialShareBtnsModule } from "./components/social-share-btns/social-share-btns.module";
// import { EmptyStateComponent } from "./components/empty-state/empty-state.component";
// import { AudioRecordingService } from "./services/audio-recording.service";

import { MatChipsModule } from "@angular/material/chips";
// import { ReadMoreComponent } from "./components/read-more/read-more.component";
// import { AnnouncementService } from "./services/announcement.service";
// import { EspLinkDirective } from "./directives/esp-link.directive";
import { InlineSVGModule } from "ng-inline-svg";
// import { FileUploadComponent } from "./components/file-upload/file-upload.component";
// import { FileUploadAreaComponent } from "./components/file-upload-area/file-upload-area.component";
// import { ConfirmationDialogComponent } from "./dialogs/confirmation-dialog/confirmation-dialog.component";
// import { XcdrsCanDeactivateGuard } from "./guards/xcdrs-can-deactivate-guard.service";
// import { FileComponent } from "./components/file/file.component";
// import { LineClamperComponent } from "./components/line-clamper/line-clamper.component";
// import { InformationDialogComponent } from "./dialogs/information-dialog/information-dialog.component";
// import { FileUpload2Component } from "./components/file-upload-2/file-upload-2.component";
// import { CapturePicDialogComponent } from "./dialogs/capture-pic-dialog/capture-pic-dialog.component";
import { FlexModule } from "@angular/flex-layout";
// import { AudioRecordComponent } from "./components/audio-record/audio-record.component";
import { MatDividerModule } from "@angular/material/divider";
// import { VideoContainerComponent } from "./components/video-container/video-container.component";
import { TranslateModule } from "@ngx-translate/core";
import { BreadcrumbsComponent } from "./components/breadcrumbs/breadcrumbs-activity.component";
import { ActivitySizeDetectorComponent } from "./components/screen-size-detector/size-detector-activity.component";
import { ActivitySearchFieldComponent } from "./components/search-field/search-field-activity.component";
// import { TreeChecklistComponent } from './components/tree-checklist/tree-checklist.component';


@NgModule({
  declarations: [
    // ShareLinkDialogComponent,
    // SigninProposeComponent,
    ActivitySearchFieldComponent,
    BreadcrumbsComponent,
    ActivitySizeDetectorComponent,
    // LoadingComponent,
    // ClickOutsideDirective,
    // LastDirective,
    // EspLinkDirective,
    // BackBtnComponent,
    // SocialLinksComponent,
    // SocialShareListComponent,
    // EmptyStateComponent,
    // ReadMoreComponent,
    // FileUploadComponent,
    // FileUpload2Component,
    // FileUploadAreaComponent,
    // ConfirmationDialogComponent,
    // FileComponent,
    // LineClamperComponent,
    // InformationDialogComponent,
    // CapturePicDialogComponent,
    // AudioRecordComponent,
    // VideoContainerComponent,
    // TreeChecklistComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([]),
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    // SocialShareBtnsModule,
    MatChipsModule,
    InlineSVGModule,
    FlexModule,
    MatDividerModule,
    FormsModule,
    TranslateModule,
    MatTreeModule,
    MatCheckboxModule,
    MatSelectModule
  ],
  exports: [
    CommonModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    ActivitySearchFieldComponent,
    BreadcrumbsComponent,
    ActivitySizeDetectorComponent,
    // LoadingComponent,
    // ClickOutsideDirective,
    // LastDirective,
    // EspLinkDirective,
    // BackBtnComponent,
    // SocialLinksComponent,
    // SocialShareListComponent,
    // EmptyStateComponent,
    // ReadMoreComponent,
    // FileUploadComponent,
    // FileUploadAreaComponent,
    // FileUpload2Component,
    // ConfirmationDialogComponent,
    // LineClamperComponent,
    // FileComponent,
    // CapturePicDialogComponent,
    // VideoContainerComponent,
    TranslateModule,
    MatTreeModule,
    // TreeChecklistComponent,
    MatCheckboxModule
  ],
  providers: [
    // SignInProposeService,
    MatSnackBar,
    // AudioRecordingService,
    // AnnouncementService,
    // XcdrsCanDeactivateGuard
  ]
})
export class ActivitySharedModule {}
