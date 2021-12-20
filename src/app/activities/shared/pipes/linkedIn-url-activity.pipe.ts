import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'linkedInURL'
})
export class linkedInUrlPipe implements PipeTransform {
  transform(value: any): string {
    if (value != null && value != undefined) {
      if(value.indexOf('www.') == 0){
        return 'https://' + value;
      }else{
        return value;
      }
    }else{
      return value;
    }
    
  }
}