import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'numberPipe'})
export class ArabicNumberPipe implements PipeTransform {

  transform(n: any): string {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    const isArabic = lang ? (lang.locale == 'ar' || false) : false;
    if (n === null || n === undefined) {
      return '';
    }
    if(isArabic) {
      return new Intl.NumberFormat('ar-SA',{}).format(n);
    } else {
      return n;
    }
  }
}