import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "cutExtension"
})
export class CutExtensionPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): string {
    return value.replace(/\.[^/.]+$/, "");
  }
}
