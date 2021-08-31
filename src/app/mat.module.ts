import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { _MatMenuDirectivesModule, MatMenuModule } from '@angular/material/menu';


@NgModule({
  declarations: [],
  imports: [
    _MatMenuDirectivesModule,
    MatMenuModule,
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
    MatFormFieldModule,
    MatIconModule,
    MatSnackBarModule
  ],
  providers: [],
  exports: [
    _MatMenuDirectivesModule,
    MatMenuModule,
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
    MatFormFieldModule,
    MatIconModule,
    MatSnackBarModule
  ]
})
export class MatModule {}
