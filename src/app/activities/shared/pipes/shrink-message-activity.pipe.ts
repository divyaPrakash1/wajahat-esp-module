import {Pipe, PipeTransform} from '@angular/core';
import {APP_DEFAULTS} from '../../shared/models/app-defaults-activity';

@Pipe({
  name: 'shrinkMessage'
})
export class ShrinkMessagePipe implements PipeTransform {
  private numberOfLines = 8;
  private esitmatedCharInOneLine = 125; // rough esitmate
  private charAllowed: number = this.numberOfLines * this.esitmatedCharInOneLine;

  transform(str: string, args?: any): any {
    if (str) {
      let tokens: string[] = str.split('\n');
      let shrinkedMessage = '';
      for (const token of tokens) {
        if (token != '') {
          if (shrinkedMessage != '') {
            shrinkedMessage += '\n';
          }
          shrinkedMessage += token;
        }
      }
      let showReadMore = false;
      tokens = shrinkedMessage.split('\n');
      if (tokens.length > this.numberOfLines) {
        showReadMore = true;
        tokens = tokens.slice(0, this.numberOfLines);
      }
      shrinkedMessage = '';
      let allowedChar: number = this.charAllowed;
      let breakOuterLoop = false;
      for (let j = 0; j < tokens.length; j++) {
        if (breakOuterLoop) {
          break;
        }
        const newAllowedChar: number = this.charAllowed - (j * this.esitmatedCharInOneLine);
        allowedChar = Math.min(allowedChar, newAllowedChar);
        if (allowedChar > 0) {
          const charLenghtOfLine: number = tokens[j].length;
          if (charLenghtOfLine <= allowedChar) {
            shrinkedMessage += tokens[j];
            shrinkedMessage += '\n';
            allowedChar -= charLenghtOfLine;
          } else {
            const lineWords: string[] = tokens[j].split(' ');
            for (let i = 0; i < lineWords.length; i++) {
              if (lineWords[i].length <= allowedChar) {
                shrinkedMessage += lineWords[i];
                shrinkedMessage += ' ';
                allowedChar = allowedChar - lineWords[i].length - 1; // 1 for space that we are adding
              } else {
                if (i == 0) {
                  shrinkedMessage = lineWords[i].substr(0, allowedChar) + ' ';
                }
                showReadMore = true;
                breakOuterLoop = true;
                break;
              }
            }
          }
        }
      }
      if (showReadMore) {
        shrinkedMessage = shrinkedMessage.substr(0, shrinkedMessage.length - 1);
        shrinkedMessage += ' ' + APP_DEFAULTS.READ_MORE_IDENTIFIER;
      }

      return shrinkedMessage;
    }
    return '';
  }

}
