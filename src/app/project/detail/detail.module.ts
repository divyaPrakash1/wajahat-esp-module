import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DetailRoutingModule } from './detail-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { LayoutModule } from 'src/app/layout/layout.module';

import { DetailComponent } from './detail.component';
import { ProjectDetailComponent } from './detail/detail.component';
import { RisksComponent } from './risks/risks.component';
import { IssuesComponent } from './issues/issues.component';
import { RequestsComponent } from './requests/requests.component';
import { ActivitiesComponent } from './activities/activities.component';
import { HistoryComponent } from './history/history.component';
import { ProjectDetailService } from './detail.service';

import { MatTabsModule } from '@angular/material/tabs';
import { _MatMenuDirectivesModule, MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SignPopupComponent } from './detail/sign-popup/sign-popup.component';
import { ClosePopupComponent } from './detail/close-popup/close-popup.component';
import { ProjectDeletePopupComponent } from './detail/project-delete-popup/project-delete-popup.component';
import { ProjectStatePopupComponent } from './detail/project-state-popup/project-state-popup.component';
import {MatRadioModule} from '@angular/material/radio';
import { RevokePopupComponent } from './detail/revoke-popup/revoke-popup.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ProjectSignaturesComponent } from './common/project-signatures/project-signatures.component';
import { ProjectRequirementStatsComponent } from './common/project-requirement-stats/project-requirement-stats.component';
import { ProjectTagsPopupComponent } from './detail/project-tags-popup/project-tags-popup.component';
import { AddTagsPopupComponent } from './general/add-tags-popup/add-tags-popup.component';
import { ProjectSettingPopupComponent } from './detail/project-setting-popup/project-setting-popup.component';
import { PipeModule } from 'src/app/shared/pipe/pipe.module';

@NgModule({
  declarations: [
    DetailComponent,
    ProjectDetailComponent,
    RisksComponent,
    IssuesComponent,
    RequestsComponent,
    ActivitiesComponent,
    HistoryComponent,
    SignPopupComponent,
    ClosePopupComponent,
    ProjectDeletePopupComponent,
    ProjectStatePopupComponent,
    ProjectSettingPopupComponent,
    RevokePopupComponent,
    ProjectSignaturesComponent,
    ProjectRequirementStatsComponent,
    ProjectTagsPopupComponent,
    AddTagsPopupComponent
  ],
  imports: [
    CommonModule,
    DetailRoutingModule,
    SharedModule,
    LayoutModule,
    MatTabsModule,
    _MatMenuDirectivesModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatDialogModule,
    PipeModule.forRoot(),
  ],
  providers: [ProjectDetailService]
})
export class DetailModule { }
