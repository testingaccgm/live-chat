import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterUnique',
  pure: false
})
export class FilterPipe implements PipeTransform {

  transform(value: any): any {
    let uniqueArray = value.filter((el: any, index: number, array: any) => { 
      return array.indexOf (el) == index;
    });

    return uniqueArray;
  }
}
