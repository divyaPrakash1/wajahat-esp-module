import { Injectable, Output, EventEmitter } from "@angular/core";
import { Observable, forkJoin, of } from "rxjs";
import { AuthService, AuthType } from "./auth.service";
// import { Addon } from "src/app/shared/models/addon.model";
import { map, switchMap, mergeMap, tap, catchError } from "rxjs/operators";
import { environment } from "src/environments/environment";
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpRequest,
} from "@angular/common/http";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
// import { authentication } from "@microsoft/teams-js";
import { throwError } from "rxjs/internal/observable/throwError";
import { Addon } from "../models/addon.model-activity";
// import { IStemexeModule } from "src/app/data-providers/interfaces/interfaces";
// import { StemexeDataProviderService } from "src/app/data-providers/services/stemexe-data-provider.service";
// import { DataProvider, PagedData, PagedDataItem } from "src/app/data-providers/models/models";
// import { ActivitiesService } from "src/app/activities/activity/services/activities.service";
// import { EspDataProviderService } from "src/app/requests/esp/common/services/esp-data-provider.service";
// import { PlannexeDataProviderService } from "src/app/plannexe/stemexe-providers.service";
// import { EngagementProDataProviderService } from "src/app/engagement/engagement.pro.providers.service";
// import { OpporunityProDataProviderService } from "src/app/opporunity/opportunity.stemexe.providers.service";

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
            (addon: any) =>
              addon.Type.toLowerCase() == AuthType.SimpleStrata.toLowerCase()
          );
        })
      );
  }

  getIdenediCode(): Observable<string> {
    const url = `${environment.idenediProviderUrl}/api/oauth/AuthorizationCode?client_id=XSS1977020300`;
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.Idenedi),
    };
    return this.http.get<any>(url, options).pipe(
      map((code) => {
        return code;
      })
    );
  }

  getSimpleStrataToken(): Observable<Addon> {
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
                const headers = new HttpHeaders({
                  "client-id": "web",
                  locale: "en",
                });
                let orgId = localStorage.getItem("organziationId");
                let data: {
                  IdenediCode: string;
                  OrganizationId?: any;
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
                      this.loggedInUserId = resp && resp.ResponseResult ? resp.ResponseResult.userId : null;
                      results[0].AccessToken = resp && resp.ResponseResult ? resp.ResponseResult.access_token : null;
                      if(resp && resp.ResponseResult) {
                        localStorage.setItem("SignInByIdenediToken", resp.ResponseResult.access_token);
                      }
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
    private _simplestrataAuthService: SimplestrataAuthService,
    // private _engproDataProvider: EngagementProDataProviderService
  ) {
    // this._engproDataProvider.initialize();
  }

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
    private _simplestrataAuthService: SimplestrataAuthService,
    // private simpleStrataDataProviderService: SimpleStrataDataProviderService
  ) {
    // this.simpleStrataDataProviderService.initialize();
  }

  resolve() {
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.Idenedi),
    };

    let url = `${environment.idenediProviderUrl}/api/oauth/AuthorizationCode?client_id=XSS1977020300`;

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
            // return [];
            return throwError(errorResp);
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


// @Injectable({
//   providedIn: "root"
// })
// export class SimpleStrataDataProviderService implements IStemexeModule {

//   constructor(
//     private _stemexeHost: StemexeDataProviderService,
//     private _activitiesService: ActivitiesService,
//     private _authService: AuthService
//     ) {
//   }

//   initialize(): void {
//     this._stemexeHost.registerModule(this)
//   }

//   getDataProviders(providerType: string): Observable<DataProvider[]> {
//     let espDataProviders: DataProvider[] = [];
//     if (providerType == 'ActivitySource') {
//       return this._authService.getAuthAddonByType(AuthType.SimpleStrata).pipe(
//         switchMap(addon => {
//         // console.log("asdfasdfasdf", addon);
//         let reqDataProvider: DataProvider = new DataProvider();
//         // reqDataProvider.title = 'ESP Request';
//         // reqDataProvider.id = '1';
//         // reqDataProvider.system = 'qaesp.azurewebsites.net';
//         // reqDataProvider.tenantId = '2';

//         reqDataProvider.title = 'SimpleStrata';
//         reqDataProvider.id = '0';
//         reqDataProvider.system = addon.BaseUrl;
//         reqDataProvider.tenantId = addon.OrganziationId; // orgId of SS

//         reqDataProvider.getData = (token) => {
//           return this._getProviderData(reqDataProvider, token)
//         }
//         espDataProviders.push(reqDataProvider);
//         return of(espDataProviders);
//       }));
//     }
//   }
//   private _getProviderData(provider: DataProvider, nextPageToken?: any): Observable<PagedData> {
//     if(provider.id == '0') {
//       return this._activitiesService.searchForMySpace(nextPageToken).pipe(map((resp) => { 
//         console.log("resp", resp);
//         let pagedData = new PagedData();
//         // let item1 = new PagedDataItem();
//         // item1.id = '1';
//         // item1.extraData = {
//         //   'createdBy': 9,
//         //   'createdAt': '10-10-2022'
//         // }
//         // item1.title = 'Job Application',
//         //   item1.url = '/pages/requests/1'
//         // pagedData.items = [item1];
//         let items = resp.ResponseResult.map((obj)=> {
//           let item = new PagedDataItem();
//           item.id = obj.Id;
//           item.title = obj.Name;
//           item.extraData = obj;
//           item.getData = (nextPageToken) => this._getNextData(provider, item, nextPageToken);
//           return item;
//         });
//         pagedData.items = items;
//         return pagedData;
//       }));
//     } else {
//       console.log('token', nextPageToken)
//       let pagedData = new PagedData();
//       // let item1 = new PagedDataItem();
//       // item1.id = '1';
//       // item1.extraData = {
//       //   'createdBy': 9,
//       //   'createdAt': '10-10-2022'
//       // }
//       // item1.title = 'Job Application',
//       //   item1.url = '/pages/requests/1'
//       // pagedData.items = [item1];
  
  
//       // pagedData.items.map(item => {
//       //   item.getData = (nextPageToken) => this._getNextData(provider, item, nextPageToken);
//       //   return item;
//       // })
//       return of(pagedData);
//     }
//   }


//   private _getNextData(provider: DataProvider, pagedDataItem: PagedDataItem, nextPageToken?: any) {
//     // let pagedData = new PagedData();
//     return this._activitiesService.getAllByParent(nextPageToken).pipe(map((resp) => {
//       console.log("resp", resp);
//       let pagedData = new PagedData();
//       let items = resp.ResponseResult.Tactics.map((obj)=> {
//         let item = new PagedDataItem();
//         item.id = obj.TacticId;
//         item.title = obj.TacticTitle;
//         item.extraData = obj;
//         // item.getData = (nextPageToken) => this._getNextData(provider, item, nextPageToken);
//         return item;
//       });
//       pagedData.items = items;
//       return pagedData;
//     }));
//     // pagedData.items.map(item => {
//     //   item.getData = (nextPageToken) => this._getNextData(provider, item, nextPageToken);
//     //   return item;
//     // })
//     // return of(pagedData); // nested api calling if any 
//   }


//   openUrl(url: string, context: any): any { }
// }

// @Injectable({
//   providedIn: "root"
// })
// export class AllDataProviderResolver implements Resolve<Observable<any>> {
//   constructor(
//     private _planexeDataProvider: PlannexeDataProviderService,
//     private _ssDataProvider: SimpleStrataDataProviderService,
//     private _espDataProviderService: EspDataProviderService,
//     private _engProDataProviderService: EngagementProDataProviderService,
//     private _oppProDataProviderService: OpporunityProDataProviderService,
//     ) {
//   }
//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable <any> {
//     this._ssDataProvider.initialize();
//     this._planexeDataProvider.initialize();
//     this._espDataProviderService.initialize();
//     this._engProDataProviderService.initialize();
//     this._oppProDataProviderService.initialize();
//     return of();
//   }
// }
