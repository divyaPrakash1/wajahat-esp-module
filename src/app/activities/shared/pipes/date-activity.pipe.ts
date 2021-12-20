import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({name: 'datePipe'})
export class ArabicDatePipe implements PipeTransform {

  transform(n: any, formate:any): any {
    // debugger
    if (n === null || n === undefined) {
      return '';
    }
    //if(n instanceof Date) {
      let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
      const isArabic = lang ? (lang.locale == 'ar' || false) : false;
      let date = '';
      if (isArabic) {
        if(formate == "medium") {
          moment.locale('ar');
          date = moment(n).format('DD MMM yyyy');
        } else if(formate == "short") {
          moment.locale('ar');
          date = moment(n).format('h:mm a');
        } else if(formate == "lable") {
          moment.locale('ar');
          date = moment(n).format('DD yyy');
        } 
      } else {
        if(formate == "medium") {
          //moment.locale('en');
          date = moment(n).format('DD MMM yyyy');
        } else if(formate == "short") {
          //moment.locale('en');
          date = moment(n).format('DD MMM yyyy');
        }
      }
      if(date != 'Invalid date')
      return date;
      else return n;
    //} else {
    //  return n;
    //}
  }
}