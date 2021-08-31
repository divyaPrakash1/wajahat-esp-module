import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SprintsRoutingModule } from './sprints-routing.module';
import { SprintsComponent } from './sprints.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatRadioModule } from '@angular/material/radio';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SprintListingComponent } from './sprint-listing/sprint-listing.component';
import { SprintListViewComponent } from './sprint-list-view/sprint-list-view.component';
import { SprintGirdViewComponent } from './sprint-gird-view/sprint-gird-view.component';
import { SprintAddComponent } from './sprint-add/sprint-add.component';
import { SprintDetailComponent } from './sprint-detail/sprint-detail.component';
import { TagInputModule } from 'ngx-chips';
import { SharedModule } from 'src/app/shared/shared.module';
import { LayoutModule } from 'src/app/layout/layout.module';
import { PipeModule } from 'src/app/shared/pipe/pipe.module';
import { SprintSignComponent } from './sprint-sign/sprint-sign.component';
import { SprintRevokeComponent } from './sprint-revoke/sprint-revoke.component';
import { SprintCloseRequestComponent } from './sprint-close-request/sprint-close-request.component';
import { SprintDeleteComponent } from './sprint-delete/sprint-delete.component';
import { SprintCloseComponent } from './sprint-close/sprint-close.component';
import { DeliverableMarkDoneComponent } from './deliverable-mark-done/deliverable-mark-done.component';
import { DeliverableMarkMissedComponent } from './deliverable-mark-missed/deliverable-mark-missed.component';
import { DeliverableRemoveComponent } from './deliverable-remove/deliverable-remove.component';
import { DeliverableReopenComponent } from './deliverable-reopen/deliverable-reopen.component';

@NgModule({
  declarations: [
    SprintsComponent,
    SprintListingComponent,
    SprintListViewComponent,
    SprintGirdViewComponent,
    SprintAddComponent,
    SprintDetailComponent,
    SprintSignComponent,
    SprintRevokeComponent,
    SprintCloseRequestComponent,
    SprintDeleteComponent,
    SprintCloseComponent,
    DeliverableMarkDoneComponent,
    DeliverableMarkMissedComponent,
    DeliverableRemoveComponent,
    DeliverableReopenComponent
  ],
  imports: [
    CommonModule,
    LayoutModule,
    SharedModule,
    SprintsRoutingModule,
    PipeModule.forRoot(),
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTabsModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    NgxSliderModule,
    MatRadioModule,
    NgxMatSelectSearchModule,
    TagInputModule,
  ]
})
export class SprintsModule { }
