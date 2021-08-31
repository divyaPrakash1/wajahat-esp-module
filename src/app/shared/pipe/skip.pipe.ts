import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'skip', pure: false})
export class SkipPipe implements PipeTransform {
  transform(value: any, amount: number): any {
    if (value == null){
      return value;
    }

    // if (!this.supports(value)) {
    //   throw invalidPipeArgumentError(SkipPipe, value);
    // }

    return value.filter((v: any, i: any) => (i % amount === 0));
  }

  private supports(obj: any): boolean { return typeof obj === 'string' || Array.isArray(obj); }
}

