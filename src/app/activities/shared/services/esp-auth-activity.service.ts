import { Injectable } from "@angular/core";
import { Observable, forkJoin, of } from "rxjs";
// import { ActivityAuthService, AuthType } from "./auth-activity.service";
// import { Addon } from "src/app/shared/models/addon.model";
import { map, switchMap, mergeMap, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpRequest
} from "@angular/common/http";
import { Resolve } from "@angular/router";
import { Addon } from "../models/addon.model-activity";
import { UserInfoService } from "./userinfo-activity-service";
import { AuthService, AuthType } from "src/app/shared/services/auth.service";
// import { UserInfoService } from "../../requests/esp/common/services/userinfo-service";

@Injectable({
  providedIn: "root"
})
export class EspAuthService {
  constructor(
    // private _authService: ActivityAuthService,
    private _authService: AuthService,
    private http: HttpClient,
    private _userInfoService: UserInfoService
  ) {}

  getEspAuth(): Observable<Addon> {
    return this._authService
      .getAddonsAuth(this._authService.idenediGroupId)
      .pipe(
        map(addons => {
          return addons.find(
            addon => addon.Type.toLowerCase() == AuthType.ESP.toLowerCase()
          );
        })
      );
  }

  getIdenediCode(): Observable<string> {
    const url = `${environment.idenediProviderUrl}/api/oauth/AuthorizationCode?client_id=XSP1980031200`;
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.Idenedi)
    };
    return this.http.get<any>(url, options).pipe(
      map(code => {
        console.log(code);
        return code;
      })
    );
  }

  getEspToken(): Observable<Addon> {
    return this.getEspAuth().pipe(
      switchMap(addon => {
        if (!addon) {
          return of(null);
        }
        if (addon?.AccessToken) {
          return of(addon);
        } else {
          return forkJoin([this.getEspAuth(), this.getIdenediCode()]).pipe(
            switchMap(results => {
              // results[0] is our getEspAuth() - addon
              // results[1] is our getIdenediCode() - code
              //http://qaesp.azurewebsites.net/webapi/orguser/idenediTokenV2/{code}/{orgId}
              return this.http
                .get<any>(
                  `${results[0].BaseUrl}/orguser/idenediTokenV3/${results[1]}/${results[0].OrganziationId}`
                )
                .pipe(
                  map(resp => {
                    results[0].AccessToken = resp.token.accessToken;
                    this._userInfoService.role = resp.user.role;
                    this._userInfoService.isApplicant = resp.user.isApplicant;
                    this._userInfoService.imageUrl = resp.user.imageUrl;
                    this._userInfoService.organizationId = parseInt(
                      resp.user.organizationId
                    );
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
  providedIn: "root"
})
export class EspTokenResolverServiceForActivity implements Resolve<Observable<any>> {
  constructor(private _espAuthService: EspAuthService) {}

  resolve() {
    return this._espAuthService.getEspToken().pipe(map(espAddon => espAddon));
  }
}
