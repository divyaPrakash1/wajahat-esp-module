import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { CurrencyModel } from '../models/currency-model';
import { AuthService, AuthType } from './auth.service';
    
@Injectable()
export class ManageCurrenciesService {
  public currencies: CurrencyModel[] = [];
  constructor(private http: HttpClient, private _authService: AuthService) { }

  updateCurrencies(Currencies: CurrencyModel[]): Observable<any> {
      return this.http.put<any>('/currency', Currencies, this._authService.espOptions);
  }

  getCurrencies(): Observable<HttpResponse<CurrencyModel[]>> {
    return this.http.get<CurrencyModel[]>('/currency', { observe: 'response', headers: this._authService.buildAuthHeader(AuthType.ESP) });
  }
}

