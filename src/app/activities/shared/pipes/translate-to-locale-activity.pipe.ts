import { Pipe, PipeTransform } from '@angular/core';
import { TranslationHelperService } from '../../activity/services/translation-helper.service';

@Pipe({
  name: 'translateToLocale'
})
export class TranslateToLocalePipe implements PipeTransform {
  constructor(private _translationHelperService: TranslationHelperService) { }
  transform(value: any, fallback: boolean = true): any {
    return this._translationHelperService.translateToLocale(value, fallback)
  }

}