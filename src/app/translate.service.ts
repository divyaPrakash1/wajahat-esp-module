import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Subject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { reduce, merge, isEmpty, includes} from 'lodash';
import { MissingTranslationHandler, MissingTranslationHandlerParams} from '@ngx-translate/core';

@Injectable()
export class TranslationsLoaderService implements TranslateLoader {
  private currentLoading: any = [];
  private translation: any = {};
  private lang: any = localStorage.getItem('language');

  constructor(private http: HttpClient) {
  }

  getTranslation(lang: string): Observable<any> {
    this.fromLocal();
    if (!isEmpty(this.translation) && lang === this.lang){
      return of(this.translation);
    }
    else{
      this.lang = lang;
      return this.http.get(environment.baseURL + `/api/Language/GetAllLabels`)
      .pipe(
        map((response: any) => {
          response = response.result;
          const result = this.formatLang(response);
          this.translation = result;
          this.toLocal();
          return result;
        })
      );
    }
  }

  private formatLang(response: any): void{
    return reduce(response, (result: any, v, k) => {
      const value = (this.lang == 'ar' ? v.labelValueAr : v.labelValueEn);
      if (!result[v.module]){
        result[v.module] = {};
      }
      if (result[v.module] && !result[v.module][v.formSection]){
        result[v.module][v.formSection] = {};
      }
      if (result[v.module] && result[v.module][v.formSection] && !result[v.module][v.formSection][v.formType]){
        result[v.module][v.formSection][v.formType] = {};
      }
      result[v.module][v.formSection][v.formType][v.labelKeyword] = value;
      return result;
    }, {});
  }
  private fromLocal(): void{
    let local = localStorage.getItem('e.trans');
    local = JSON.parse(local ? local : '{}');
    this.translation = local;
  }
  private toLocal(): void{
    localStorage.setItem('e.trans', JSON.stringify(this.translation));
    localStorage.setItem('language', this.lang);
  }

  loadByModule(m: any): void{
    m = m.split('.');
    m = m[0];
    if (!includes(this.currentLoading, m)){
      this.currentLoading.push(m);
      this.http.get(environment.baseURL + `/api/Language/GetLabelsByForms?module=` + m)
      .subscribe((projects: any) => {
        projects = projects.result;
        let result = this.formatLang(projects);
        console.log(this.translation, result);
        result = merge(this.translation, result);
        console.log(result);
        this.translation = result;
        this.toLocal();
      });
    }
  }
}



export class MyMissingTranslationHandler implements MissingTranslationHandler {
  constructor(private http: HttpClient) {}
  handle(params: MissingTranslationHandlerParams): string{
    const t = new TranslationsLoaderService(this.http);
    t.loadByModule(params.key);
    return 'loading';
  }

}
