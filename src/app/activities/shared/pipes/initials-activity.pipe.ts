import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'initials'
})
export class InitialsPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value && value.length > 0) {
      const rgx = new RegExp(/(\p{L}{1})\p{L}+/, 'gu');
      const initials = [...value.matchAll(rgx)] || [];

      value = (
        (initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')
      ).toUpperCase();
    }
    return value;
  }

}
