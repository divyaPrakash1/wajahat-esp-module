import {Inject, LOCALE_ID, Pipe} from '@angular/core';
import {DatePipe} from '@angular/common';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoExtendsPipe {
  constructor(@Inject(LOCALE_ID) private locale: string) {
  }

  transform(value: string, daysTillApply?: number, datePipeFormat?: string): string {
    const date = new Date(value);
    if (daysTillApply && (date.getTime() + daysTillApply * 24 * 60 * 60 * 1000 < Date.now())) {
      if (datePipeFormat) {
        return new DatePipe(this.locale).transform(value, datePipeFormat);
      }
      return value;
    }
    let now = new Date();
    let seconds = Math.round(Math.abs((now.getTime() - date.getTime()) / 1000));
    let minutes = Math.round(Math.abs(seconds / 60));
    let hours = Math.round(Math.abs(minutes / 60));
    let days = Math.round(Math.abs(hours / 24));
    let months = Math.round(Math.abs(days / 30.416));
    let years = Math.round(Math.abs(days / 365));
    if (Number.isNaN(seconds)) {
      return '';
    } else if (minutes <= 5) {
      return 'just now';
    } else if (minutes <= 45) {
      return minutes + ' minutes ago';
    } else if (minutes <= 90) {
      return 'an hour ago';
    } else if (hours <= 22) {
      return hours + ' hours ago';
    } else if (hours <= 36) {
      return 'a day ago';
    } else if (days <= 25) {
      return days + ' days ago';
    } else if (days <= 45) {
      return 'a month ago';
    } else if (days <= 345) {
      return months + ' months ago';
    } else if (days <= 545) {
      return 'a year ago';
    } else { // (days > 545)
      return years + ' years ago';
    }
  }
}
