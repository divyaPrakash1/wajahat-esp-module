import {Pipe, PipeTransform} from '@angular/core';
import * as marked from 'marked';

@Pipe({
  name: 'markdownToHtmlPipe'
})
export class MarkdownToHtmlPipe implements PipeTransform {

  transform(value: any, ...args: any[]): unknown {
    if (value && value.length > 0) {
      return marked(value);
    }
    return value;
  }

}
