import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { ActivityAlertComponent } from './alert-activity.component';


@NgModule({
  declarations: [ActivityAlertComponent],
  exports: [ActivityAlertComponent],
  imports: [
    CommonModule
  ]
})
export class ActivityAlertModule {
}
