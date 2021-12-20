import { NgModule } from "@angular/core";
import { CommonModule, registerLocaleData } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";
import { NgCircleProgressModule } from "ng-circle-progress";
import { MatTabsModule } from "@angular/material/tabs";
import { ActivitiesRoutingModule } from "./activities-routing.module";
import { ActivitiesMainComponent } from "./activities-main/activities-main.component";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatCardModule } from "@angular/material/card";
import { MatTableModule } from "@angular/material/table";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MineActivitiesComponent } from "./activities-main/mine-activities/mine-activities.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRadioModule } from "@angular/material/radio";
import { ActivityDetailsComponent } from "./activities-main/activity-details/activity-details.component";
import { AvatarModule } from "ngx-avatar";
import { CloseDialog } from "./dialogs/close-dialog/close-dialog";
import { LogDialog } from "./dialogs/log-dialog/log-dialog";
import { ConfirmCloseDialog } from "./dialogs/confirm-close-dialog/confirm-close-dialog";
import { ConfirmLogDialog } from "./dialogs/confirm-log-dialog/confirm-log-dialog";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatOptionModule, MatNativeDateModule, MAT_DATE_LOCALE } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { OwlDateTimeModule, OwlNativeDateTimeModule } from "ng-pick-datetime";
import { MatDividerModule } from "@angular/material/divider";
import { FollowingActivitiesComponent } from "./activities-main/following-activities/following-activities.component";
import { FollowedUserDetailsComponent } from "./activities-main/following-activities/followed-user-details/followed-user-details.component";
import { ActivityDialog } from "./dialogs/activity-dialog/activity-dialog";
import { ConfirmCreateDialog } from "./dialogs/confirm-create-dialog/confirm-create-dialog";
import { CalendarModule, DateAdapter } from 'angular-calendar';

import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSelectModule } from "@angular/material/select";
import { CarouselComponent } from "./carousel/carousel.component";
import { CarouselDetailsComponent } from "./carousel/carousel-details/carousel-details.component";
import { RejectDialog } from "./dialogs/reject-dialog/reject-dialog";
import { ConfirmRejectDialog } from "./dialogs/confirm-reject-dialog/confirm-reject-dialog";
import { FiltersDialog } from "./dialogs/filters-dialog/filters-dialog";
import { BacklogActivitiesComponent } from "./activities-main/backlog-activities/backlog-activities.component";
import { WeekGraphComponent } from "./week-graph/week-graph.component";

import { MatChipsModule } from "@angular/material/chips";
import { ConfirmDeleteDialog } from "./dialogs/confirm-delete-dialog/confirm-delete-dialog";
import { ActivitiesTableComponent } from "./activities-table/activities-table.component";
import { OppProDialog } from "./dialogs/opp-pro-dialog/opp-pro-dialog";
import { SpeedDialFabComponent } from "./speed-dial-fab/speed-dial-fab.component";
import { ScheduleDueDateDialog } from "./dialogs/schedule-due-date-dialog/schedule-due-date-dialog";
import { RecuringDialog } from "./dialogs/recuring-dialog/recuring-dialog";

import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { ActivitiesGroupComponent } from './activities-group/activities-group.component';
import { RecurringResultDialog } from './dialogs/recurring-result-dialog/recurring-result-dialog';
import { SharedActivitiesComponent } from './activities-main/following-activities/shared-activities/shared-activities.component';
import { ShareWithUsersDialogComponent } from './dialogs/share-with-users-dialog/share-with-users-dialog.component';
import { ActivitiesActionsComponent } from './activities-actions/activities-actions.component';
import { EpmSettingsDialogComponent } from './dialogs/epm-settings-dialog/epm-settings-dialog.component';
import { LinkToEpmProjectComponent } from './dialogs/link-to-epm-project/link-to-epm-project.component';
import { AuthEpmDialogComponent } from './dialogs/auth-epm-dialog/auth-epm-dialog.component';
import { ActivitiesSignatureComponent } from "./activities-signature/activities-signature.component";
import { ClosedActivitiesComponent } from './activities-signature/closed-activities/closed-activities.component';
import { SignedDialogComponent } from './dialogs/signed-dialog/signed-dialog.component';
import { SignedActivitiesComponent } from './activities-signature/signed-activities/signed-activities.component';
import { RejectedActivitiesComponent } from './activities-signature/rejected-activities/rejected-activities.component';
import { SignatureFilterDialog } from './dialogs/signature-filter-dialog/signature-filter-dialog.component';
import { RejectMultipleDialogComponent } from './dialogs/reject-multiple-dialog/reject-multiple-dialog.component';
import { RevokeDialogComponent } from './dialogs/revoke-dialog/revoke-dialog.component';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import localear from '@angular/common/locales/ar';
import { PipesModule } from "../shared/pipes/pipes-activity.module";
import { ActivitySharedModule } from "../shared/shared-activity.module";
import { ActivityResizeService } from "../shared/services/resize-activity.service";
import { DetailedPanelPlaceholderModule } from "./detailed-panel-placeholder/detailed-panel-placeholder.module";
import { ActivityAlertModule } from "../shared/alert/alert-activity.module"; // this module's component (xcdrs-activity-alert) needs to provide decorator where routing starts 
import { ActivitiesCounterComponent } from "./activities-counter/activities-counter.component";
// import { MatModule } from "src/app/mat.module";

registerLocaleData(localear);
@NgModule({
  declarations: [
    ActivitiesMainComponent,
    MineActivitiesComponent,
    ActivityDetailsComponent,
    CloseDialog,
    LogDialog,
    ConfirmCloseDialog,
    ConfirmLogDialog,
    FollowingActivitiesComponent,
    FollowedUserDetailsComponent,
    ActivityDialog,
    ConfirmCreateDialog,
    CarouselComponent,
    CarouselDetailsComponent,
    RejectDialog,
    ConfirmRejectDialog,
    FiltersDialog,
    BacklogActivitiesComponent,
    WeekGraphComponent,
    ConfirmDeleteDialog,
    ActivitiesTableComponent,
    OppProDialog,
    SpeedDialFabComponent,
    ScheduleDueDateDialog,
    RecuringDialog,
    ActivitiesGroupComponent,
    RecurringResultDialog,
    SharedActivitiesComponent,
    ShareWithUsersDialogComponent,
    ActivitiesActionsComponent,
    EpmSettingsDialogComponent,
    LinkToEpmProjectComponent,
    AuthEpmDialogComponent,
    ActivitiesSignatureComponent,
    ClosedActivitiesComponent,
    SignedDialogComponent,
    SignedActivitiesComponent,
    RejectedActivitiesComponent,
    SignatureFilterDialog,
    RejectMultipleDialogComponent,
    RevokeDialogComponent,
    ActivitiesCounterComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    NgCircleProgressModule.forRoot({
      radius: 15,
      space: -3,
      maxPercent: 100,
      outerStrokeGradient: false,
      outerStrokeWidth: 3,
      outerStrokeColor: "#00a3ff",
      // outerStrokeGradientStopColor: "#53a9ff",
      outerStrokeLinecap: "square",
      innerStrokeColor: "#e3e9f5",
      innerStrokeWidth: 3,
      title: "0",
      titleColor: "#00a3ff",
      titleFontSize: "14",
      titleFontWeight: "700",
      imageHeight: 15,
      imageWidth: 15,
      animateTitle: false,
      animationDuration: 500,
      showSubtitle: false,
      showUnits: false,
      showBackground: false,
      startFromZero: true,
      showZeroOuterStroke: false,
    }),
    MatTabsModule,
    MatCardModule,
    MatExpansionModule,
    MatTableModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatOptionModule,
    MatNativeDateModule,
    MatDividerModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    MatChipsModule,
    MatSlideToggleModule,
    // MatModule,
    InfiniteScrollModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    AvatarModule,
    FormsModule,
    ReactiveFormsModule,
    DetailedPanelPlaceholderModule,
    PipesModule,
    ActivitySharedModule,
    ActivitiesRoutingModule,
  ],
  providers: [
    ActivityResizeService,
    // MatDatepickerModule,
    // MatNativeDateModule,
    // {
    //   provide: MAT_DATE_LOCALE, useValue:"en-UK"
    // },
    // {
    //   provide: DateAdapter,
    //   useClass: MomentDateAdapter,
    //   deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS_FACTORY]
    // }
  ],
  exports:[
    ActivityDetailsComponent,
    CloseDialog,
    LogDialog,
    ActivityDialog,
    ConfirmCreateDialog,
    RejectDialog,
    FiltersDialog,
    ActivitiesTableComponent,
    SpeedDialFabComponent,
    ScheduleDueDateDialog,
    RecuringDialog,
    RecurringResultDialog,
    ActivitiesActionsComponent,
  ]
})
export class NewActivitiesModule {}
