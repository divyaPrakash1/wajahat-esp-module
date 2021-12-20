import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "fileExtension"
})
export class FileExtensionPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
    return value.substr(value.lastIndexOf(".") + 1);
  }
}
