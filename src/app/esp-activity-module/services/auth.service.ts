import {Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpRequest
} from '@angular/common/http';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Observable, of, Subject, throwError } from 'rxjs';
import { Addon, JsonData } from '../models/addon.model';
import { environment } from '../../../environments/environment';
import { ApiError } from './api-error';

export const ESP_LOGIN_DATA = 'esp.login.data';
const IDENEDI_GROUP_ID_KEY = 'user.chosen.idenedi.group.id';
const IDENEDI_USER_ID = 'idenedi.user.id';
const IDENEDI_TOKEN_STORAGE_KEY = 'idenedi.auth.token';
const TOKEN_EXPIRES_AT_KEY = 'idenedi.auth.token-expires-at';
const REFRESH_TOKEN_STORAGE_KEY = 'idenedi.auth.refresh-token';
const NO_TOKEN_ERROR = 'no.token.error';
export const AUTH_TYPE_HEADER = 'x-auth-type';
const TECHNADOPT_AUTH_SETTINGS = {
  domain: 'https://partnersevlsbe.azurewebsites.net',
  refreshToken: '7efab48b-6829-42b3-94ba-3cad166eed4d',
  userId: 'eca-app@exceeders.com',
  password: 'P@ssw0rd'
};

export enum AuthType {
  None = 'none',
  Idenedi = 'idenedi',
  Technadopt = 'technadopt',
  ESP = 'esp',
  SimpleStrata = 'simple strata',
  Stemexe = 'stemexe',
  OppPro = 'oppPro',
  CustomTab = 'custom tab',
  Higher = 'higher',
  PowerBi = 'power bi',
  Intajy = 'intajy',
  TabOrder = 'tabOrder',
  AppAppearance = 'app appearance',
  TestData = 'data',
  MainAccessToken = 'MainAccessToken',
  AccessToken = 'AccessToken',
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  fakeToken!: string;
  espOptions: any;
  ssOptions: any;
  private _expiresAt!: number;
  private _addonsData: { [groupId: string]: Addon[] } = {};
  private _legacyTechnadoptAddon!: Addon;
  private _idenediToken: any;
  private _groupWiseAddon$: any = {}

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.espOptions = {
      headers: this.buildAuthHeader(AuthType.ESP)
    };
    this.ssOptions = {
      headers: this.buildAuthHeader(AuthType.SimpleStrata)
    };
  }

  private loadStaticData() {
    this._addonsData['cc'].push({
      BaseUrl: 'https://qaesp.azurewebsites.net/webapi',
      Type: 'ESP',
      AccessToken:
        'xb6_t_BnO-lA_xaurWZp_-ftyFeoDEsMN5r2-A0GueAn0wisrWQMrvYxdO-2EVJWm5yVfGznBq0MVEROizgoUyShI5Txy7eRy4nmsCim7hMZmnhA7oX73rzSGA-CrveWMAE6L4pwfyn_rXLVPaFBU1qyBUL--cxrlqNdcwln32Qa7IgzaajTI8fdwGojHo9ys-wFk5MmMaNi91RtKs7bOufwOhTX2Et5nIec25Sx4qPN7th7B9THykhjDcnsNiuoL9w9bELgApiigz6P2vJEwkF9dq2VtjqyvW65GVJ6aKfOe66-wKseDzmaA3tnsKYccIlumLNypriIIT7vYt9VnQXinKHuNf9kSnTm2TeKQY8u03J_t-eqf8r-0OMNHOEGXesEWaK1OmKAoJhxaAver9EPaZZn9M8H3NGRoKI_mte0cwouoMqaB0KmHjz4iNtqW9wyFRXQHNGvpjhpuw6zG8LIKvit2zqGN2Tjivcast0yoiE7CAY_VzXGcLz0RF_5iIWr1dnbDF_P1_vfmO0zZWy4IZGvO1f2PwElbdXwLPwL98Aqfmbz08cxiEJjzIAeMjalKykDif5LbUokMOUVz9xXkGDROP9RsJfLxC9BBL_ylb5FnDmg34f5ZwsB1cCLyfZ6j_7OgdIVNA6k9U5GE9FpjWMggZAODH7kPDSv4JlEnJkju2z-v-F4Fa8ytXR4XbqqZZ5ffM8m79rzgt2Vgf6S3EuPxVvd2Vma3BPrNMlCjRkpevDPvoTur5nffSFPnFa5dCyTwG4s0jRMphDHGPavWWTXr-MMfaDXRoxYKW0FgCPkF_Ebjk3nOQ2rwwdMW2w6OzjuGNJNjM9AMqukkTSv4AIZs96okUI80zy3DXGMhgJiSFFQXtDtyBlhz8jt',
      OrganziationId: 176
    });
    // 3333-44-0344
  }

  get idenediToken(): any {
    if (!this._idenediToken) {
      this._idenediToken = localStorage.getItem(IDENEDI_TOKEN_STORAGE_KEY);
    }
    return this._idenediToken;
  }

  set idenediToken(value: any) {
    this._idenediToken = value;
    if (value) {
      localStorage.setItem(IDENEDI_TOKEN_STORAGE_KEY, value);
    } else {
      localStorage.removeItem(IDENEDI_TOKEN_STORAGE_KEY);
    }
  }

  get idenediTokenExpiresAt(): number {
    if (!this._expiresAt) {
      this._expiresAt = +localStorage.getItem(TOKEN_EXPIRES_AT_KEY)!;
    }
    return this._expiresAt;
  }

  set idenediTokenExpiresAt(value: number) {
    this._expiresAt = value;
    if (value) {
      localStorage.setItem(TOKEN_EXPIRES_AT_KEY, value + '');
    } else {
      localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
    }
  }

  get idenediGroupId(): string {
    if (environment.enableGroupsSelection &&
      localStorage.getItem(IDENEDI_GROUP_ID_KEY)) {
      return localStorage.getItem(IDENEDI_GROUP_ID_KEY)!;
    }
    return environment.idenediGroupId;
  }

  set idenediGroupId(value: string) {
    if (environment.enableGroupsSelection) {
      if (!value) {
        localStorage.removeItem(IDENEDI_GROUP_ID_KEY);
      } else {
        localStorage.setItem(IDENEDI_GROUP_ID_KEY, value);
      }
    } else {
      throw new Error('This functionality is disabled');
    }
  }

  get idenediGroupIdForActivities(): string {
    if (environment.enableGroupsSelection) {
      return this.idenediGroupId;
    }
    return environment.idenediGroupIdForActivities;
  }

  isLoggedIn(): boolean {
    return !!this.idenediToken;
  }

  isIdenediTokenExpired(): boolean {
    if (!this.idenediTokenExpiresAt) {
      return false;
    }
    // 1 minute delay to refresh token
    return Date.now() > this.idenediTokenExpiresAt - 60 * 1000;
  }

  getToken(
    login: string,
    password: string,
    countryCode: string
  ): Observable<any> {
    const body = new HttpParams({
      fromObject: {
        grant_type: 'password',
        client_id: environment.authClientId,
        client_secret: environment.authClientSecret,
        username: login,
        password,
        region: countryCode
      }
    });
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>(
      `${environment.idenediProviderUrl}/oauth/token`,
      body.toString(),
      {headers}
    ).pipe(
      tap(({access_token, refresh_token, expires_in = 604799, idenedi}) => {
        this.idenediToken = access_token;
        this.idenediTokenExpiresAt = Date.now() + expires_in * 1000;
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refresh_token);
        localStorage.setItem(IDENEDI_USER_ID, idenedi);
      }),
      catchError((e) => {
        return throwError(ApiError.fromResponse(e));
      })
    );
  }

  getFakeToken(): Observable<string> {
    const {PUBLIC_USER} = environment;
    const body = new HttpParams({
      fromObject: {
        grant_type: 'password',
        client_id: environment.authClientId,
        client_secret: environment.authClientSecret,
        username: PUBLIC_USER.publicUserNumber,
        password: PUBLIC_USER.publicUserPassword,
        region: PUBLIC_USER.countryCode
      }
    });
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<any>(
      `${environment.idenediProviderUrl}/oauth/token`,
      body.toString(),
      {headers}
    ).pipe(
      tap(({access_token}) => {
        this.fakeToken = access_token;
      }),
      map(({access_token}) => {
        return access_token;
      }),
      catchError((e) => {
        return throwError(ApiError.fromResponse(e));
      })
    );
  }

  tryRefreshIdenediToken(): Observable<any> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (!refreshToken) {
      return throwError(NO_TOKEN_ERROR);
    }
    return this.refreshToken(refreshToken);
  }

  refreshToken(refreshToken: string): Observable<any> {
    const body = new HttpParams({
      fromObject: {
        grant_type: 'refresh_token',
        client_id: environment.authClientId,
        client_secret: environment.authClientSecret,
        refresh_token: refreshToken
      }
    });
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<any>(
      `${environment.idenediProviderUrl}/oauth/token`,
      body.toString(),
      {headers}
    ).pipe(
      tap(({access_token, refresh_token, expires_in}) => {
        this.idenediToken = access_token;
        this.idenediTokenExpiresAt = Date.now() + expires_in * 1000;
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refresh_token);
      }),
      catchError((e) => {
        return throwError(ApiError.fromResponse(e));
      })
    );
  }

  ensureIdenediToken(): Observable<any> {
    if (!this.isLoggedIn()) {
      return of(null);
    }
    if (this.isIdenediTokenExpired()) {
      return this.tryRefreshIdenediToken().pipe(catchError(() => of(null)));
    }
    return of(this.idenediToken);
  }

  /**
   * @deprecated please use getToken(...) to sign in
   */
  login(
    phoneNumber: string,
    password: string,
    countryCode: string
  ): Observable<string> {
    const body: any = {
      Identity: phoneNumber,
      Password: password,
      Region: countryCode
    };
    return this.http.post(`${environment.idenediProviderUrl}/api/account/Login`,
      body).pipe(
      map((response: any) => response.Token),
      tap((token) => (this.idenediToken = token)),
      catchError((e) => {
        return throwError(ApiError.fromResponse(e));
      })
    );
  }

  sendVerificationSMS(
    login: string,
    isNewUser: boolean = true,
    countryCode?: string
  ): Observable<any> {
    const body: any = isNewUser
      ? {
        PhoneNumber: login
      }
      : {
        Identity: login
      };
    if (countryCode) {
      body.Region = countryCode;
    }
    return this.http.post(
      `${environment.idenediProviderUrl}/api/account/SendSMSVerificationCode`,
      body
    ).pipe(
      catchError((e) => {
        return throwError(ApiError.fromResponse(e));
      })
    );
  }

  verifySMSCode(
    login: string,
    code: string,
    isNewUser: boolean = true,
    countryCode?: string
  ): Observable<any> {
    const body: any = {
      [isNewUser ? 'PhoneNumber' : 'Identity']: login,
      VerificationCode: code
    };
    if (countryCode) {
      body.Region = countryCode;
    }
    return this.http.post(
      `${environment.idenediProviderUrl}/api/account/VerifySMSVerificationCode`,
      body
    ).pipe(
      catchError((e) => {
        return throwError(ApiError.fromResponse(e));
      })
    );
  }

  register(
    firstName: string,
    lastName: string,
    password: string,
    phoneNumber: string,
    verificationCode: number,
    countryCode: string
  ): Observable<string> {
    const body = {
      FirstName: firstName,
      LastName: lastName,
      PhoneNo: phoneNumber,
      VerificationCode: verificationCode,
      Password: password,
      Country: countryCode
    };
    return this.http.post(
      `${environment.idenediProviderUrl}/api/account/Register`, body).pipe(
      map((response: any) => response.Token),
      tap((token) => (this.idenediToken = token))
    );
  }

  resetPassword(
    login: string,
    code: string,
    password: string,
    countryCode?: string
  ) {
    const body: any = {
      Identity: login,
      NewPassword: password,
      VerificationCode: code
    };
    if (countryCode) {
      body.Region = countryCode;
    }
    return this.http.post(
      `${environment.idenediProviderUrl}/api/account/ResetPassword`,
      body
    );
  }

  logout(redirectToLogin: boolean = true): void {
    this.idenediToken = undefined;
    localStorage.removeItem(IDENEDI_USER_ID);
    localStorage.removeItem('higherUser');
    localStorage.removeItem(ESP_LOGIN_DATA);
    this._addonsData = {};
    this._groupWiseAddon$ = {}
    this.removeEspToken();
    if (environment.enableGroupsSelection) {
      this.idenediGroupId = '';
    }
    if (redirectToLogin) {
      this.router.navigate(['/auth/login']);
    }
  }

  getCurrentUserId(): string {
    return localStorage.getItem(IDENEDI_USER_ID)!;
  }

  // This method is responsible to get and set all addons that system supports for now Technadopt and Esp is handled
  getAddonsAuth(groupId: string): Observable<any[]> {
    //debugger
    if (this._addonsData[groupId]?.length) {
      return of(this._addonsData[groupId]);
    }
    if (this._groupWiseAddon$[groupId]) {
      return this._groupWiseAddon$[groupId]
    }
    this._groupWiseAddon$[groupId] = new Subject<Addon[]>()
    const url = `${environment.apiHost}/api/group/${groupId}/addon`;
    const options = {headers: this.buildAuthHeader(AuthType.Idenedi)};
    return this.http.get<any>(url, options).pipe(
      map((addons) => {
        if (!this._addonsData[groupId]) {
          this._addonsData[groupId] = [];
        }
        const technadoptAddon = addons.find(
          (a:any) => a.Type.toLowerCase() === AuthType.Technadopt
        );
        if (technadoptAddon) {
          this._addonsData[groupId].push({
            Type: AuthType.Technadopt,
            BaseUrl: technadoptAddon.BaseUrl,
            AccessToken: technadoptAddon.AccessToken,
            OrganziationId: technadoptAddon?.PublicProperties?.organziationId,
            HomeTopicId: technadoptAddon?.PublicProperties?.homeTopicId || null,
            technadoptAuthData: undefined
          });
        }
        const espAddon = addons.find(
          (a:any) => a.Type.toLowerCase() === AuthType.ESP
        );
        if (espAddon) {
          const espAuthItem: Addon = new Addon();
          espAuthItem.Type = AuthType.ESP;
          espAuthItem.BaseUrl = espAddon.BaseUrl;
          espAuthItem.AccessToken = '';//espAddon.AccessToken
          const orgId = espAddon.PublicProperties['organziationId'];
          if (orgId) {
            espAuthItem.OrganziationId = +orgId;
          }
          espAuthItem.Configuration = espAddon.Configuration
          const claimOwnershipData = espAddon.PublicProperties['claimOwnershipData'];
          if (claimOwnershipData) {
            const claimOwnershipDataParsed = JSON.parse(claimOwnershipData)
            espAuthItem.espClaimOwnershipData = claimOwnershipDataParsed;
          }
          this._addonsData[groupId].push(espAuthItem);
        }
        // const simpleStrataAddon = addons.find(
        //   (a) => a.Type.toLowerCase() === AuthType.SimpleStrata
        // );
        const simpleStrataAddon:any = {
          Type: "Simple Strata",
          BaseUrl: "https://testing-simplestrata.azurewebsites.net/WebApi/",
          AccessToken: null,
          PublicProperties: {
            baseURL: "https://testing-simplestrata.azurewebsites.net/WebApi/",
            domain: "https://testing-simplestrata.azurewebsites.net",
            // organziationId: "330",
            organziationId: "",
          },
          InstanceId: "kUbEcE2dAEqC5o20CNlGXw",
          EntityType: "GroupAddOn>",
        };
        if (simpleStrataAddon) {
          const simpleStrataAuthItem: Addon = new Addon();
          simpleStrataAuthItem.Type = AuthType.SimpleStrata;
          simpleStrataAuthItem.BaseUrl = simpleStrataAddon.BaseUrl;
          const orgId = simpleStrataAddon.PublicProperties['organziationId'];
          if (orgId) {
            simpleStrataAuthItem.OrganziationId = +orgId;
          }

          this._addonsData[groupId].push(simpleStrataAuthItem);
        }

        const customTabAddon: Addon[] = addons.filter(
          (a:any) => a.Type.toLowerCase() === AuthType.CustomTab
        );
        if (customTabAddon) {
          customTabAddon.forEach(element => {
            this._addonsData[groupId].push({
              Type: AuthType.CustomTab,
              BaseUrl: element.BaseUrl,
              AccessToken: element.AccessToken,
              PublicProperties: element?.PublicProperties,
              Id: element.InstanceId,
            });
          });
        }

        const higherAddon = addons.find(
          (a:any) => a.Type.toLowerCase() === AuthType.Higher
        );
        if (higherAddon) {
          const higherAuthItem: Addon = new Addon();
          let teamIds = [];
          higherAuthItem.Type = AuthType.Higher;
          // higherAuthItem.BaseUrl = higherAddon.BaseUrl;
          higherAuthItem.BaseUrl = `${higherAddon.BaseUrl}`;
          higherAuthItem.Domain = `${higherAddon.PublicProperties.domain}`;
          if (higherAddon.PublicProperties['homeTopicId']) {
            teamIds = higherAddon.PublicProperties['homeTopicId'].split(',')
          }
          higherAuthItem.TeamIds = teamIds;

          const orgId = higherAddon.PublicProperties['organziationId'];
          if (orgId) {
            higherAuthItem.OrganziationId = +orgId;
          }

          this._addonsData[groupId].push(higherAuthItem);
        }

        const powerBiAddon = addons.find(
          (a:any) => a.Type.toLowerCase() === AuthType.PowerBi
        );
        if (powerBiAddon) {
          const powerBiAuthItem: Addon = new Addon();
          powerBiAuthItem.Type = AuthType.PowerBi;
          powerBiAuthItem.AccessToken = powerBiAddon.AccessToken;
          powerBiAuthItem.BaseUrl = powerBiAddon.BaseUrl
          powerBiAuthItem.PublicProperties = powerBiAddon.PublicProperties;
          powerBiAuthItem.PublicProperties.powerBiData =
            JSON.parse(powerBiAddon.PublicProperties.powerBiData)
          const orgId = powerBiAddon.PublicProperties['organziationId'];
          if (orgId) {
            powerBiAuthItem.OrganziationId = +orgId;
          }
          this._addonsData[groupId].push(powerBiAuthItem);
        }

        const tabOrderAddon: Addon = addons.find(
          (a:any) => a.Type === AuthType.TabOrder
        );
        if (tabOrderAddon) {
          const tabOrderAuthItem = this.initTabOrderAddon(tabOrderAddon)

          this._addonsData[groupId].push(tabOrderAuthItem);
        }

        const intajyAddon: Addon = addons.find(
          (a:any) => a.Type.toLowerCase() === AuthType.Intajy
        );
        if (intajyAddon) {
          this._addonsData[groupId].push({...intajyAddon});
        }

        const appAppearanceAddon: Addon = addons.find(
          (a:any) => a.Type.toLowerCase() === AuthType.AppAppearance
        );
        if (appAppearanceAddon) {
          this._addonsData[groupId].push({...appAppearanceAddon});
        }

        return this._addonsData[groupId];
      }),
      tap(() => {
        this._groupWiseAddon$[groupId].next(this._addonsData[groupId])
        this._groupWiseAddon$[groupId].complete()
        this._groupWiseAddon$[groupId] = null
      })
    );
  }

  getPublicGroupAddon(groupId: string, authType: AuthType): Observable<Addon> {
    const url = `${environment.apiHost}/api/group/${groupId}/addon`;
    const options = {headers: this.buildAuthHeader(AuthType.None)};
    return this.http.get<any>(url, options).pipe(
      map((addonsData) => {
        const addonData = addonsData.find(
          (a:any) => a.Type.toLowerCase() === authType
        );
        if (!addonData) {
          throwError('No addon data find');
        }
        const resultAddon = new Addon();
        resultAddon.Type = authType;
        resultAddon.BaseUrl = addonData.BaseUrl;
        resultAddon.AccessToken = addonData.AccessToken;
        resultAddon.Domain = addonData.PublicProperties?.Domain;
        resultAddon.OrganziationId = addonData.PublicProperties?.OrganziationId;
        return resultAddon;
      })
    );
  }

  createNewAddon(addon: Addon, groupId: string, type: AuthType) {
    const authHeaders = this.buildAuthHeader(AuthType.Idenedi);
    const options = {
      headers: authHeaders.append('Idenedi-Api-Version', '4'),
    };
    const data = {
      BaseUrl: '',
      AccessToken: '',
      RefreshToken: '',
      PrivateConfiguration: {},
      PublicProperties: addon.PublicProperties
    }
    return this.http.post<any>(
      `${environment.apiHost}/api/group/${groupId}/addon?type=${type}`, data,
      options).pipe(tap(() => {
      // Remove all and fetch again
      this._addonsData[groupId] = []
      // this.getAddonsAuth(groupId).subscribe()
    }))
  }

  initTabOrderAddon(tabOrderAddon: Addon): Addon {
    const tabOrderAuthItem: Addon = new Addon();

    const data = JSON.parse(JSON.stringify(tabOrderAddon))
    let parsedJsonData = new JsonData(
      JSON.parse(data?.PublicProperties?.jsonData).data)

    if (!Array.isArray(parsedJsonData.data)) {
      parsedJsonData = new JsonData(
        JSON.parse(JSON.parse(data?.PublicProperties?.jsonData).data))
    }

    tabOrderAuthItem.Type = AuthType.TabOrder;
    tabOrderAuthItem.InstanceId = tabOrderAddon.InstanceId;
    tabOrderAuthItem.PublicProperties = {
      ...tabOrderAddon.PublicProperties,
      jsonData: parsedJsonData,
    };
    return tabOrderAuthItem
  }

  deleteAddon(groupId: string, addonId: string) {
    const authHeaders = this.buildAuthHeader(AuthType.Idenedi);
    const options = {
      headers: authHeaders,
    };

    return this.http.delete<any>(
      `${environment.apiHost}/api/group/${groupId}/addon/${addonId}`, options)
      .pipe(tap(() => {
        // Remove all and fetch again
        this._addonsData[groupId] =
          this._addonsData[groupId].filter(item => item.Id != addonId)
        // this.getAddonsAuth(groupId).subscribe()
      }))
  }

  ensureTechnadoptAuth(): Observable<Addon> {
    return this.getAddonsAuth(this.idenediGroupId).pipe(
      switchMap((addons) => {
        const technadoptAddon = addons.find(
          (addon) => addon.Type.toLowerCase() === AuthType.Technadopt
        );

        // We are only relogin to technadopt if the token is available but expired
        // otherwise we are not fetching it here because it would be unnecessary to call
        // we only need to that token when user goes to Products page. For that
        if (technadoptAddon?.technadoptAuthData) {
          if (this.isTechnadoptTokenExpired(
            technadoptAddon.technadoptAuthData.expiresIn)) {  // Relogin
            technadoptAddon.technadoptAuthData = undefined
            return this.getTechnadoptAuthorizedTokenIfRequired(technadoptAddon)
          }
        }

        return of(technadoptAddon);
      })
    );
  }

  isTechnadoptTokenExpired(expiresIn: number): boolean {
    return Date.now() > expiresIn - 60 * 1000
  }

  isUserLoggedInThroughTechnadopt(): Observable<boolean> {
    return this.getAddonsAuth(this.idenediGroupId).pipe(
      switchMap((addons) => {
        const technadoptAddon = addons.find(
          (addon) => addon.Type.toLowerCase() === AuthType.Technadopt
        );
        if (technadoptAddon!.technadoptAuthData) {
          return of(true);
        }
        return of(false);
      }))
  }

  getTechnadoptAuthorizedTokenIfRequired(technadoptAddon: Addon): Observable<any> {
    if (technadoptAddon && (!technadoptAddon.technadoptAuthData ||
      this.isTechnadoptTokenExpired(
        technadoptAddon.technadoptAuthData.expiresIn))) {  // Relogin
      // technadoptAddon.technadoptAuthData = null //If second condition is met (token is expired) then we remove the technadoptAuthData so that it doesn't keep calling
      return this.getIdenediAuthorizationCodeForClient(
        environment.exceederClientId)
        .pipe(
          switchMap(
            code => {
              return this.getTechnadoptToken(technadoptAddon.BaseUrl, code)
            }
          ),
          catchError((e) => {
            console.info("Technadopt token not available")
            return of(null)
          })
        )
    } else {
      return of(technadoptAddon)
    }

  }

  getLegacyTechnadoptAuth(): Observable<Addon> {
    if (this._legacyTechnadoptAddon) {
      return of(this._legacyTechnadoptAddon);
    }
    const body = new HttpParams({
      fromObject: {
        username: TECHNADOPT_AUTH_SETTINGS.userId,
        password: TECHNADOPT_AUTH_SETTINGS.password,
        grant_type: 'password'
      }
    });
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<any>(`${TECHNADOPT_AUTH_SETTINGS.domain}/token`,
      body.toString(), {
        headers
      }).pipe(
      map(({access_token}) => {
        const addon = this.createAddon(access_token);
        addon.Type = AuthType.Technadopt;
        addon.BaseUrl = TECHNADOPT_AUTH_SETTINGS.domain;
        this._legacyTechnadoptAddon = addon;
        return addon;
      })
    );
  }

  ensureEspToken(): Observable<any> {
    return this.getAddonsAuth(this.idenediGroupId).pipe(
      switchMap((addons) => {
        const espAddon = addons.find(
          (addon) => addon.Type.toLowerCase() === AuthType.ESP.toLowerCase()
        );
        if (espAddon) {
          return of(espAddon);
        } else {
          return of(null);
        }
      })
    );
  }

  ensureSimpleStrataToken(): Observable<any> {
    return this.getAddonsAuth(this.idenediGroupIdForActivities).pipe(
      switchMap((addons) => {
        const simpleStrataAddon = addons.find(
          (addon) =>
            addon.Type.toLowerCase() === AuthType.SimpleStrata.toLowerCase()
        );
        if (simpleStrataAddon) {
          return of(simpleStrataAddon);
        } else {
          return of(null);
        }
      })
    );
  }

  getAuthType(request: HttpRequest<any>): AuthType {
    return (request.headers.get(AUTH_TYPE_HEADER) as AuthType) || AuthType.None;
  }

  buildAuthHeader(authType: AuthType, engProUserId?: any): HttpHeaders {
    //debugger
    let headers;
    if (authType == AuthType.SimpleStrata) {
      if (!!engProUserId && engProUserId != null) {
        headers = new HttpHeaders({
          [AUTH_TYPE_HEADER]: authType,
          'client-id': 'web',
          locale: 'en',
          EngProLoggedInUserId: engProUserId
        });
      } else {
        headers = new HttpHeaders({
          [AUTH_TYPE_HEADER]: authType,
          'client-id': 'web',
          locale: 'en'
        });
      }
    } else if(authType == AuthType.TestData) {
      let token = localStorage.getItem('idenedi.auth.token')
      headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    } else if(authType == AuthType.MainAccessToken) {
      let token = localStorage.getItem('AccessToken')
      headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    } else if(authType == AuthType.AccessToken) {
      let token = localStorage.getItem('SignInByIdenediToken')
      headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    else {
      headers = new HttpHeaders({
        [AUTH_TYPE_HEADER]: authType,
      });
    }

    return headers;
  }

  getAuthAddonByType(authType: AuthType): Observable<any> {
    switch (authType) {
      case AuthType.Idenedi:
        return this.ensureIdenediToken().pipe(
          map((token) => {
            return this.createAddon(token);
          })
        );
      case AuthType.Technadopt:
        return environment.isLegacyAuth
          ? this.getLegacyTechnadoptAuth()
          : this.ensureTechnadoptAuth();
      case AuthType.ESP:
        return this.ensureEspToken().pipe(
          map((addon) => {
            return addon;
          })
        );
      case AuthType.SimpleStrata:
        return this.ensureSimpleStrataToken().pipe(
          map((addon) => {
            return addon;
          })
        );
      default:
        return of(null);
    }
  }

  getEspToken(groupId: string) {
    if (this._addonsData[groupId]?.length) {
      const addon = this._addonsData[groupId].find(
        (x) => x.Type == AuthType.ESP
      );
      if (addon) {
        return addon.AccessToken;
      }
    }
    return null;
  }

  getIdenediAuthorizationCodeForClient(clientId: string): Observable<string> {
    const url = `${environment.idenediProviderUrl}/api/oauth/AuthorizationCode?client_id=${clientId}`;
    const options = {
      headers: this.buildAuthHeader(AuthType.Idenedi),
    };
    return this.http.get<any>(url, options).pipe(
      map((code) => {
        return code;
      })
    );
  }

  getTechnadoptToken(baseURL: string, authCode: string): Observable<any> {
    const body = new HttpParams({
      fromObject: {
        code: authCode,
        grant_type: "idenedi"
      }
    });
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post(baseURL + "token", body.toString(), {headers}).pipe(
      switchMap(
        (tokenData: any) => {
          return this.getAuthAddonByType(AuthType.Technadopt).pipe(
            tap(
              addOn => {
                if (addOn) {
                  addOn.technadoptAuthData = {
                    accessToken: tokenData.access_token,
                    expiresIn: Date.now() + tokenData.expires_in * 1000,
                    roles: JSON.parse(tokenData.roles)
                  }
                }
              }
            )
          )
        }
      ),
      catchError((e) => {
        return throwError(ApiError.fromResponse(e));
      })
    )
  }

  private removeEspToken() {
    if (this._addonsData[this.idenediGroupId]?.length) {
      const addon:any = this._addonsData[this.idenediGroupId].find(
        (x) => x.Type == AuthType.ESP
      );
      if (addon) {
        addon.AccessToken = null;
      }
    }
  }

  private createAddon(token: string): Addon {
    const addon: Addon = new Addon();
    addon.AccessToken = token;
    return addon;
  }
}
