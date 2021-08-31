import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'amountWords'
})
export class AmountwordsPipe implements PipeTransform {

  transform(value: any, args?: any): string {
    let exp: any;
    const suffixes = ['k', 'M', 'G', 'T', 'P', 'E'];

    if (Number.isNaN(value)) {
      return null;
    }

    if (value < 1000) {
      return value;
    }

    exp = Math.floor(Math.log(value) / Math.log(1000));

    return (value / Math.pow(1000, exp)).toFixed(args) + suffixes[exp - 1];
  }

}
