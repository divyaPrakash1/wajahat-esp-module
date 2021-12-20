import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'parseLists'
})
export class ParseListsPipe implements PipeTransform {
  transform(value: any, ...args: any[]): unknown {
    if (value && value.length > 0) {
      let str = value;
      str = str.replace(/^[•●–](.*)/gim, '<li>$1</li>');
      str =
        str.replace(/(<li>(.*)(<\/li>))/gs, '<ul class="slide-list">$1</ul>');
      str = str.replace(/^[0-9]+[\.–](.*)/gim, '<utYRs524>$1</utYRs524>');
      str = str.replace(/(<utYRs524>(.*)(<\/utYRs524>))/gs,
        '<ol class="slide-list">$1</ol>');
      str = str.replace(/utYRs524/g, 'li');
      return str;
    }
    return value;
  }

}

