import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'textHighlight'
})
export class TextHighlightPipe implements PipeTransform {

  transform(value: any, searchTerm?: any): any {
    if (!searchTerm || searchTerm == '') {
      return value;
    }

    const re = new RegExp(searchTerm, 'gi');
    const html: string = value.replace(re, `<span class='idenedi-text-highlight'>${searchTerm}</span>`);

    return html;
  }

}
