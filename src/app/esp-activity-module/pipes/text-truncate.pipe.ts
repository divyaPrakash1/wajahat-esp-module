import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'textTruncate'
})
export class TextTruncatePipe implements PipeTransform {

  transform(value: unknown, maxLength: number): unknown {
    if (typeof value !== 'string' || typeof maxLength !== 'number' || maxLength < 1 || value.length <= maxLength) {
      return value;
    }
    const lastWhiteSpaceIndex = value.slice(0, maxLength).lastIndexOf(' ');
    return value.slice(0, lastWhiteSpaceIndex) + '...';
  }

}
