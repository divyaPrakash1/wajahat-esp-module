import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'textSort'
})
export class TextSortPipe implements PipeTransform {

  transform(value: any, prop: string): any {
    if (!value) {
      return [];
    }
    return value.sort(
      (itemA: any, itemB: any) => {
        let nameA: string = itemA[prop];
        let nameB: string = itemB[prop];
        nameA = nameA.toLocaleLowerCase();
        nameB = nameB.toLocaleLowerCase();
        if (nameA < nameB) //sort string ascending
        {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0; //default return value (no sorting)
      }
    )
  }
}
