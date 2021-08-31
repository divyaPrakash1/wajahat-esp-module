import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { HttpResponse, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TranslationHelperService {

  constructor(private _translateService: TranslateService, private http: HttpClient) { }
  
  translateToLocale(value: string): any {
    let parsedString = (this.IsJsonString(value)) ? JSON.parse(value) : value;
    if (this.IsJsonString(value) && value != null) {
      parsedString = parsedString[this._translateService.currentLang];
    }

    return parsedString;
  }

  IsJsonString(str:any) {
    try {
      JSON.parse(str);
      if (typeof JSON.parse(str) == "number") {
        return false;
      }
    } catch (e) {
      return false;
    }
    return true;
  }

  getTranslationByKey(key: string): string {
    let val: string = '';
    this._translateService.get(key).subscribe((value: string) => {
      val = value;
    });
    return val;
  }

  getOrganizationLocales(): Observable<HttpResponse<string>> {
    return this.http.get<string>('/webapi/settings/locales', { observe: 'response' });
  }
}
