import { NgModule } from '@angular/core';
import { AmountwordsPipe } from './amountwords.pipe';
import { SkipPipe } from './skip.pipe';

@NgModule({
  imports: [],
  declarations: [
    AmountwordsPipe,
    SkipPipe,
  ],
  exports: [
    AmountwordsPipe,
    SkipPipe,
  ]
})
export class PipeModule  {
  static forRoot(): any {
    return {
        ngModule: PipeModule,
        providers: [],
    };
 }
}
