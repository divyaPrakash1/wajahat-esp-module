import { Pipe, PipeTransform } from "@angular/core";
import { environment } from "../../../../environments/environment";

const isValidDomain = require("is-valid-domain");

@Pipe({ name: "urlify" })
export class UrlifyPipe implements PipeTransform {
  private static replaceHref(rawHTML: string): string {
    return rawHTML.replace(/href="(.*?)"/, (m, $1) => {
      if ($1.startsWith("www")) {
        return `href="//${$1}"`;
      }
      if (isValidDomain($1)) {
        return `href="//${$1}"`;
      }

      if ($1 === environment.webHost) {
        return `href="${$1}" target="_self"`;
      }
      return 'href="' + $1 + '"';
    });
  }

  transform(link: string): string {
    return UrlifyPipe.replaceHref(link);
  }
}
