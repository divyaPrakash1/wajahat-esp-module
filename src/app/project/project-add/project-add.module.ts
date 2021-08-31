import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectAddRoutingModule } from './project-add-routing.module';
import { ProjectAddComponent } from './project-add.component';
import { LayoutModule } from 'src/app/layout/layout.module';

import { _MatMenuDirectivesModule, MatMenuModule} from '@angular/material/menu';
import { MatButtonModule} from '@angular/material/button';
import { MatIconModule} from '@angular/material/icon';
import { MatTabsModule} from '@angular/material/tabs';
import { MatSelectModule} from '@angular/material/select';
import { MatInputModule} from '@angular/material/input';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule} from '@angular/material/core';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatSnackBarModule} from '@angular/material/snack-bar';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import {TranslateModule} from '@ngx-translate/core';
//import { RequestActivitiesModule } from '../../request-activity-module/request-activities/request-activities.module';


@NgModule({
  declarations: [
    ProjectAddComponent
  ],
  imports: [
    //RequestActivitiesModule,
    CommonModule,
    ProjectAddRoutingModule,
    LayoutModule,
    MatButtonModule,
    MatIconModule,
    _MatMenuDirectivesModule,
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
    TranslateModule
  ],
  exports: [TranslateModule]
})
export class ProjectAddModule { }
