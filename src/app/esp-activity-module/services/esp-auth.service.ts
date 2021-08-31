import { Injectable } from "@angular/core";
import { Observable, forkJoin, of } from "rxjs";
import { AuthService, AuthType } from "./auth.service";
import { Addon } from "../models/addon.model";
import { map, switchMap, mergeMap, tap } from "rxjs/operators";
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpRequest,
} from "@angular/common/http";
import { Resolve } from "@angular/router";
import { environment } from "../../../environments/environment";
import { UserInfoService } from "./userinfo-service";

@Injectable({
  providedIn: "root",
})
export class EspAuthService {
  constructor(
    private _authService: AuthService,
    private http: HttpClient,
    private _userInfoService: UserInfoService) { }

  getEspAuth(): Observable<Addon> {
    return this._authService.getAddonsAuth(this._authService.idenediGroupId).pipe(
      map((addons) => {
        return addons.find(
          (addon) => addon.Type.toLowerCase() == AuthType.ESP.toLowerCase()
        );
      })
    );
  }

//   import { Http, Headers, Response } from '@angular/http';

// getLoggedInUser(auth_token): Observable<any> {
//   const headers = new Headers({
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${auth_token}`
//   })
//   return this.http.get(apiUrl, { headers: headers })
// }

  getIdenediCode(): Observable<any> {
    const url = `${environment.idenediProviderUrl}/api/oauth/AuthorizationCode?client_id=XSP1980031200`;
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.TestData),
    };
    // let token = localStorage.getItem('idenedi.auth.token')
    // options.headers.append("Authorization", `Bearer ${token}`);
    // options.headers.append("Content-Type", 'application/json');
    // debugger
    // let token = localStorage.getItem('idenedi.auth.token')
    // let headers = new Headers({
    //       //'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${token}`
    //     });
    //     let aaa:any = {
    //       headers: headers
    //     }
    //const headers = new HttpHeaders({ ['x-auth-type']: AuthType.Idenedi, 'client-id': 'web', locale: 'en' })
    return this.http.get<any>(url, options).pipe(
      map((code) => {
        console.log(code);
        return code;
      })
    );
  }

  getToken() {
    return !!localStorage.getItem('idenedi.auth.token');
  }

  getEspToken(): Observable<any> {
    return this.getEspAuth().pipe(
      switchMap((addon) => {
        if (!addon){
          return of(null);
        }
        if (addon?.AccessToken) {
          return of(addon);
        } else {
          return forkJoin([this.getEspAuth(), this.getIdenediCode()]).pipe(
            switchMap((results) => {
              //debugger
              // results[0] is our getEspAuth() - addon
              // results[1] is our getIdenediCode() - code
              //http://qaesp.azurewebsites.net/webapi/orguser/idenediTokenV2/{code}/{orgId}
              // ${results[0].BaseUrl}/orguser/idenediTokenV3/${results[1]}/${results[0].OrganziationId}
              //${results[0].BaseUrl}/orguser/idenediTokenV3/${results[1]}/2
              return this.http
                .get<any>(
                  //`${results[0].BaseUrl}/orguser/idenediTokenV3/${results[1]}/${results[0].OrganziationId}`
                  `${results[0].BaseUrl}/orguser/idenediTokenV3/${results[1]}/2`
                )
                .pipe(
                  map((resp) => {
                    console.log("resp", resp);
                    localStorage.setItem('AccessToken', resp.token.accessToken);
                    results[0].AccessToken = resp.token.accessToken;
                    this._userInfoService.role = resp.user.role;
                    this._userInfoService.isApplicant = resp.user.isApplicant;
                    this._userInfoService.imageUrl = resp.user.imageUrl;
                    return results[0];
                  })
                );
            })
          );
        }
      })
    );
  }
}

@Injectable({
  providedIn: "root",
})
export class EspTokenResolverService implements Resolve<Observable<any>> {
  constructor(private _espAuthService: EspAuthService) {}

  resolve() {
    return this._espAuthService.getEspToken().pipe(map((espAddon) => espAddon));
  }
}
