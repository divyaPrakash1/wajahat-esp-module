import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { AlertModule } from './alert/alert.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivitiesActionsComponent } from './components/activities-actions/activities-actions.component';
import { ActivitiesTableComponent } from './components/activities-table/activities-table.component';
import { ApplicationDetailComponent } from './components/application-detail/application-detail.component';
import { ActivityDialog } from './components/dialogs/activity-dialog/activity-dialog';
import { CloseDialog } from './components/dialogs/close-dialog/close-dialog';
import { ConfirmCloseDialog } from './components/dialogs/confirm-close-dialog/confirm-close-dialog';
import { ConfirmDeleteDialog } from './components/dialogs/confirm-delete-dialog/confirm-delete-dialog';
import { ConfirmLogDialog } from './components/dialogs/confirm-log-dialog/confirm-log-dialog';
import { ConfirmRejectDialog } from './components/dialogs/confirm-reject-dialog/confirm-reject-dialog';
import { FiltersDialog } from './components/dialogs/filters-dialog/filters-dialog';
import { LogDialog } from './components/dialogs/log-dialog/log-dialog';
import { RejectDialog } from './components/dialogs/reject-dialog/reject-dialog';
import { SearchFieldComponent } from './components/search-field/search-field.component';
import { EspActivityRoutingModule } from './esp-activity.routing.module';
import { SizeDetectorComponent } from './components/screen-size-detector/size-detector.component';
import { MatModule } from './mat-module/mat.module';
import { SigninProposeComponent } from './components/signin-propose/signin-propose.component';
import { ActivitiesCounterComponent } from './components/request-activities/activities-counter/activities-counter.component';
import { AllActivitiesComponent } from './components/request-activities/all-activities/all-activities.component';
import { BacklogActivitiesComponent } from './components/request-activities/backlog-activities/backlog-activities.component';
import { RequestActivitiesMainComponent } from './components/request-activities/request-activities-main/request-activities-main.component';
import { ManageCurrenciesService } from './services/manage-currencies.service';
import { ResizeService } from './services/resize.service';
import { TextTruncatePipe } from './pipes/text-truncate.pipe';
import { ShareWithUsersDialogComponent } from './components/dialogs/share-with-users-dialog/share-with-users-dialog.component';
import { ActivityDetailsComponent } from './components/activities-main/activity-details/activity-details.component';
import { ScheduleDueDateDialog } from './components/dialogs/schedule-due-date-dialog/schedule-due-date-dialog';
import { SanitizeHtmlPipe } from './pipes/sanitize-html.pipe';
import { DetailedPanelPlaceholderModule } from './components/detailed-panel-placeholder/detailed-panel-placeholder.module';
import { AvatarModule } from 'ngx-avatar';
//import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { MatDialogModule } from '@angular/material/dialog';


@NgModule({
  declarations: [
    ActivitiesActionsComponent,
    ActivitiesTableComponent,
    ApplicationDetailComponent,
    ActivityDialog,
    CloseDialog,
    ConfirmCloseDialog,
    ConfirmDeleteDialog,
    ConfirmLogDialog,
    ConfirmRejectDialog,
    FiltersDialog,
    LogDialog,
    RejectDialog,
    SearchFieldComponent,
    SizeDetectorComponent,
    SigninProposeComponent,
    ActivitiesCounterComponent,
    AllActivitiesComponent,
    BacklogActivitiesComponent,
    RequestActivitiesMainComponent,
    TextTruncatePipe,
    ActivityDetailsComponent,
    ShareWithUsersDialogComponent,
    ScheduleDueDateDialog,
    SanitizeHtmlPipe
  ],
  imports: [
    CommonModule,
    EspActivityRoutingModule,
    AlertModule,
    MatModule,
    FormsModule,
    ReactiveFormsModule,
    DetailedPanelPlaceholderModule,
    AvatarModule,
    //OwlDateTimeModule,
    //OwlNativeDateTimeModule
  ],
  providers: [
    DatePipe,
    ManageCurrenciesService,
    ResizeService,
    Location,
    ActivityDialog,
    MatDialogModule
  ],
})
export class EspActivityModule {}
