import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchPipe'
})
export class SearchPipePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!value) {
      return null;
    }

    if (!args) {
      return value;
    }

    args = args.toLowerCase();

    return value.filter((data: any) => {
      return JSON.stringify(data.name).toLocaleLowerCase().includes(args) || 
        JSON.stringify(data.email).toLocaleLowerCase().includes(args);
    });
  }
}
