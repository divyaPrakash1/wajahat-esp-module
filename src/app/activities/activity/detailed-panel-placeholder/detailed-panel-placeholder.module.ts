import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DetailedPanelPlaceholderComponent} from './detailed-panel-placeholder.component';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [DetailedPanelPlaceholderComponent],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [DetailedPanelPlaceholderComponent]
})
export class DetailedPanelPlaceholderModule {}
