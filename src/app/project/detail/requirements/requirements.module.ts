import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequirementsRoutingModule } from './requirements-routing.module';
import { RequirementsComponent } from './requirements.component';
import {MatButtonModule} from '@angular/material/button';
import { AddComponent } from './add/add.component';
import { MatIconModule} from '@angular/material/icon';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { RequirementAdvanceViewComponent } from './requirement-advance-view/requirement-advance-view.component';
import { RequirementGirdViewComponent } from './requirement-gird-view/requirement-gird-view.component';
import { RequirementListViewComponent } from './requirement-list-view/requirement-list-view.component';
import { RequirementBacklogListComponent } from './requirement-backlog-list/requirement-backlog-list.component';
import { RequirementNormalViewComponent } from './requirement-normal-view/requirement-normal-view.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PipeModule } from 'src/app/shared/pipe/pipe.module';
import { MatMenuModule, _MatMenuDirectivesModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { LayoutModule } from 'src/app/layout/layout.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RequirementGroupViewComponent } from './requirement-group-view/requirement-group-view.component';
import {MatTabsModule} from '@angular/material/tabs';
import { RequirementDetailViewComponent } from './requirement-detail-view/requirement-detail-view.component';
import { RequirementTagsPopupComponent } from './requirement-tags-popup/requirement-tags-popup.component';
import { RequirementStateChangeComponent } from './requirement-state-change/requirement-state-change.component';
import { RequirementSignPopupComponent } from './requirement-sign-popup/requirement-sign-popup.component';
import { RequirementRevokePopupComponent } from './requirement-revoke-popup/requirement-revoke-popup.component';
import { RequirementClosePopupComponent } from './requirement-close-popup/requirement-close-popup.component';
import { RequirementDeletePopupComponent } from './requirement-delete-popup/requirement-delete-popup.component';
import { RequirementAcceptanceCriteriaComponent } from './requirement-acceptance-criteria/requirement-acceptance-criteria.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { RequirementCategoryPopupComponent } from './requirement-category-popup/requirement-category-popup.component';
import { DeliverableCommitComponent } from './deliverable-commit/deliverable-commit.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [
    RequirementsComponent,
    AddComponent,
    RequirementAdvanceViewComponent,
    RequirementGirdViewComponent,
    RequirementListViewComponent,
    RequirementBacklogListComponent,
    RequirementNormalViewComponent,
    RequirementGroupViewComponent,
    RequirementDetailViewComponent,
    RequirementTagsPopupComponent,
    RequirementStateChangeComponent,
    RequirementSignPopupComponent,
    RequirementRevokePopupComponent,
    RequirementClosePopupComponent,
    RequirementDeletePopupComponent,
    RequirementAcceptanceCriteriaComponent,
    RequirementCategoryPopupComponent,
    DeliverableCommitComponent
  ],
  imports: [
    CommonModule,
    LayoutModule,
    SharedModule,
    RequirementsRoutingModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    _MatMenuDirectivesModule,
    MatMenuModule,
    MatRadioModule,
    MatSlideToggleModule,
    PipeModule.forRoot(),
    MatTabsModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatCheckboxModule,
  ]
})
export class RequirementsModule { }
