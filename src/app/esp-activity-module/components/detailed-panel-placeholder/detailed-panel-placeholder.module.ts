import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DetailedPanelPlaceholderComponent} from './detailed-panel-placeholder.component';

@NgModule({
  declarations: [DetailedPanelPlaceholderComponent],
  imports: [
    CommonModule
  ],
  exports: [DetailedPanelPlaceholderComponent]
})
export class DetailedPanelPlaceholderModule {}
