import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsComponent } from './comments/comments.component';
import { AttachmentsComponent } from './attachments/attachments.component';
import { ConfirmationDailogComponent } from './dailogs/confirmation-dailog/confirmation-dailog.component';

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
import { TranslateModule } from '@ngx-translate/core';
import { TagInputModule } from 'ngx-chips';
import { AttachmentDeletePopupComponent } from './dailogs/attachment-delete-popup/attachment-delete-popup.component';
import { HistoryComponent } from './history/history.component';

@NgModule({
  declarations: [
    AttachmentsComponent,
    CommentsComponent,
    ConfirmationDailogComponent,
    AttachmentDeletePopupComponent,
    HistoryComponent,
  ],
  imports: [
    CommonModule,
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
    TagInputModule,
    TranslateModule,
  ],
  exports: [
    AttachmentsComponent,
    CommentsComponent,
    HistoryComponent,
    ConfirmationDailogComponent,
  ]
})
export class SharedModule { }
