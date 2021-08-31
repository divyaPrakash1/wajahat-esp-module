import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';
import { MenuComponent } from 'src/app/layout/menu/menu.component';
import { RouterModule } from '@angular/router';
import { SearchableSelectComponent } from './ui/searchable-select/searchable-select.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';


@NgModule({
  declarations: [
    MenuComponent,
    SearchableSelectComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    NgxMatSelectSearchModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatIconModule,
  ],
  exports: [
    MenuComponent,
    SearchableSelectComponent,
  ]
})
export class LayoutModule { }
