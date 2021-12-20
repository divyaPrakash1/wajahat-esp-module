import {Pipe, PipeTransform} from '@angular/core';
import {APP_DEFAULTS} from '../../shared/models/app-defaults-activity';

@Pipe({
  name: 'readMoreLink'
})
export class ReadMoreLinkPipe implements PipeTransform {

  transform(str: string, args?: any): any {
    if (str) {

      return str.replace(APP_DEFAULTS.READ_MORE_IDENTIFIER, '<a href="#" class="read-more">...Read more</a>');
    }
    return '';
  }

}
