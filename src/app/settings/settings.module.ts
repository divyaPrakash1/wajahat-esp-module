import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import {TranslateModule} from '@ngx-translate/core';
import { LayoutModule } from 'src/app/layout/layout.module';


@NgModule({
  declarations: [
    SettingsComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    SettingsRoutingModule,
    LayoutModule,
  ]
})
export class SettingsModule { }
