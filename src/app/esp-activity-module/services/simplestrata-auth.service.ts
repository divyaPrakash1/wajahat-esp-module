import { Injectable, Output, EventEmitter } from "@angular/core";
import { Observable, forkJoin, of, throwError } from "rxjs";
import { AuthService, AuthType } from "./auth.service";
import { map, switchMap, mergeMap, tap, catchError } from "rxjs/operators";
import {
  HttpClient,
  HttpHeaders
} from "@angular/common/http";
import { Resolve } from "@angular/router";
import { Addon } from "../models/addon.model";
import { environment } from "../../../environments/environment";

const IDENEDI_TOKEN_STORAGE_KEY = "idenedi.auth.token";
@Injectable({
  providedIn: "root",
})
export class SimplestrataAuthService {
  public loggedInUserId: any;
  public engagementProLoggedInUserId: any = null;
  public engagementProTeams: any = null;
  public engagementProData: any = null;
  public oppProData: any = null;
  isEngagementProEnabled: boolean = false;
  idenediToken: any;
  constructor(private _authService: AuthService, private http: HttpClient) {}

  getSimpleStrataAuth(): Observable<Addon> {
    return this._authService
      .getAddonsAuth(this._authService.idenediGroupIdForActivities)
      .pipe(
        map((addons) => {
          return addons.find(
            (addon) =>
              addon.Type.toLowerCase() == AuthType.SimpleStrata.toLowerCase()
          );
        })
      );
  }

  getIdenediCode(): Observable<string> {
    const url = `${environment.idenediProviderUrl}/api/oauth/AuthorizationCode?client_id=XSS1977020300`;

    const options = {
      headers: this._authService.buildAuthHeader(AuthType.TestData),
    };
    return this.http.get<any>(url, options).pipe(
      map((code) => {
        return code;
      })
    );
  }

  getSimpleStrataToken(): Observable<Addon> {
    console.log("getSimpleStrataToken");
    return this.getSimpleStrataAuth().pipe(
      switchMap((addon) => {
        if(!!addon){
          if (addon.AccessToken) {
            return this.getSimpleStrataAuth();
          } else {
            return forkJoin([
              this.getSimpleStrataAuth(),
              this.getIdenediCode(),
            ]).pipe(
              switchMap((results) => {
                // results[0] is our getSimpleStrataAuth() - addon
                // results[1] is our getIdenediCode() - code
                const orgId = !!localStorage.getItem("e.user") ? JSON.parse(localStorage.getItem("e.user")!).organizationId : null;

                const headers = new HttpHeaders({
                  "client-id": "web",
                  locale: "en",
                });
                let data: {
                  IdenediCode: string;
                  OrganizationId?: number;
                  IdenediGroupId?: string;
                } = {
                  IdenediCode: results[1],
                  OrganizationId: orgId,
                  IdenediGroupId: this._authService.idenediGroupIdForActivities
                };

                if (environment.production) {
                  data.IdenediGroupId = this._authService.idenediGroupIdForActivities;
                  data.OrganizationId = results[0].OrganziationId;
                }
                return this.http
                  .post<any>(
                    `${results[0].BaseUrl}api/UserApi/SignInByIdenedi`,
                    data,
                    { headers: headers }
                  )
                  .pipe(
                    map((resp) => {
                      this.loggedInUserId = resp.ResponseResult.userId;
                      results[0].AccessToken = resp.ResponseResult.access_token;
                      localStorage.setItem("SignInByIdenediToken", resp.ResponseResult.access_token);
                      return results[0];
                    })
                  );
              })
            );
          }
        } else {
          return [];
        }
      })
    );
  }
}

@Injectable({
  providedIn: "root",
})
export class SimpleStrataTokenResolverService
  implements Resolve<Observable<any>> {
  constructor(private _simplestrataAuthService: SimplestrataAuthService) {}

  resolve() {
    return this._simplestrataAuthService
      .getSimpleStrataToken()
      .pipe(map((simpleStrataAddon) => simpleStrataAddon));
  }
}

@Injectable({
  providedIn: "root",
})
export class engagementProTokenResolverService
  implements Resolve<Observable<any>> {
  constructor(
    private _authService: AuthService,
    private http: HttpClient,
    private _simplestrataAuthService: SimplestrataAuthService
  ) {}

  resolve() {
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.Stemexe),
    };

    let url = environment.production
      ? `https://stemexess2.azurewebsites.net/api/Stemexe/AuthenticateUser`
      : `https://stemexess.azurewebsites.net/api/Stemexe/AuthenticateUser`;
    let data = {
      module: "EngagementPro",
      clientCode: environment.engProClientCode,
      userInfo: {
        uniqueKey: localStorage.getItem(IDENEDI_TOKEN_STORAGE_KEY),
        userName: "string",
        password: "string",
        info1: "string",
        info2: "string",
      },
      apiInfo: {
        clientId: "string",
        clientSecret: "string",
        key1: "string",
        key2: "string",
      },
      authFlow: 0,
    };
    return this.http.post<any>(url, data, options).pipe(
      catchError((errorResp) => {
        return throwError(errorResp);
      }),
      switchMap((resp) => {
        if (
          !!resp &&
          resp.code == "001" &&
          resp.result.organizationList.length > 0
        ) {
          let data = {
            clientCode: environment.engProClientCode, // "engagementpro-sslive", //environment.engProClientCode,
            module: "EngagementPro",
            authToken: resp.result.authToken,
            organizationToken: resp.result.organizationList[0],
          };

          this._simplestrataAuthService.engagementProData = data;
          return this.http
            .post<any>(
              `https://stemexess.azurewebsites.net/api/Stemexe/GetSSUserInfo`,
              data,
              options
            )
            .pipe(map((resp) => resp));
        } else {
          return [];
        }
      })
    );
  }
}

@Injectable({
  providedIn: "root",
})
export class oppProTokenResolverService implements Resolve<Observable<any>> {
  constructor(
    private _authService: AuthService,
    private http: HttpClient,
    private _simplestrataAuthService: SimplestrataAuthService
  ) {}

  resolve() {
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.Idenedi),
    };

    let url = `${environment.idenediProviderUrl}/api/oauth/AuthorizationCode?client_id=XOP1956092300`;

    return this.http.get<any>(url, options).pipe(
      catchError((errorResp) => {
        return throwError(errorResp);
      }),
      switchMap((code) => {
        let url = `${environment.oppProApi}/tenant/GetTenantUrlByIdenediAuthCode?ClientCode=${environment.oppProClientCode}&authorizationCode=${code}`;
        const options = {
          headers: this._authService.buildAuthHeader(AuthType.OppPro),
        };
        return this.http.get<any>(url, options).pipe(
          catchError((errorResp) => {
            return [];
            //return throwError(errorResp);
          }),
          switchMap((resp) => {
            if (!!resp && resp.length > 0) {
              let data = {
                customHeader: resp[0].customHeader,
                fclJson: resp[0].fclJson,
                idenediAccessToken: resp[0].idenediAccessToken,
                idenediRefreshToken: resp[0].idenediRefreshToken,
                tenantIsChild: resp[0].tenantIsChild,
                tenantIsMaster: resp[0].tenantIsMaster,
                tennantCode: resp[0].tennantCode,
                tennantMapUrl: resp[0].tennantMapUrl,
                tennantName: resp[0].tennantName,
                userIdentifier: resp[0].userIdentifier,
              };
              this._simplestrataAuthService.oppProData = {
                tennantMapUrl: data.tennantMapUrl,
                customHeader: data.customHeader,
              };
              environment.oppProApiHost = data.tennantMapUrl;
              let url = `${data.tennantMapUrl}/AuthenticateUserByTenant?idenedi=${data.userIdentifier}&accessToken=${data.idenediAccessToken}&refreshToken=${data.idenediRefreshToken}&Mode=web`;
              const options = {
                headers: new HttpHeaders({ customheader: data.customHeader }),
              };

              return this.http.post<any>(url, null, options).pipe(
                catchError((errorResp) => {
                  return throwError(errorResp);
                }),
                map((resp) => resp)
              );
            } else {
              return [];
            }
          })
        );
      })
    );
  }
}
