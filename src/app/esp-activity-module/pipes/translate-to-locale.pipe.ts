import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translateToLocale'
})
export class TranslateToLocalePipe implements PipeTransform {
  constructor(private translate: TranslateService) { }
  transform(value: any, args?: any): any {
    let parsedString: any = (this.IsJsonString(value)) ? JSON.parse(value) : value;
    if (this.IsJsonString(value) && value != null) {
      parsedString = parsedString[this.translate.currentLang];
    }
    if (parsedString) {
      return parsedString.trim();
    } else {
      return parsedString;
    }
  }

  IsJsonString(str:any) {
    try {
      JSON.parse(str);

      if (typeof JSON.parse(str) == "number") {
        return false;
      }
    } catch (e) {
      return false;
    }
    return true;
  }

}
