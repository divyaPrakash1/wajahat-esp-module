import { Injectable } from "@angular/core";
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
// import {
//   AUTH_TYPE_HEADER,
//   ActivityAuthService,
//   AuthType,
// } from "../services/auth-activity.service";
import { catchError, switchMap } from "rxjs/operators";
import { AuthService, AuthType, AUTH_TYPE_HEADER } from "src/app/shared/services/auth.service";

@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
  constructor(
    // private authService: ActivityAuthService,
    private authService: AuthService,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<any> {
    const authType = this.authService.getAuthType(request);
    return this.authService.getAuthAddonByType(authType).pipe(
      switchMap((addon) => {
        let changedReq: any = request;
        let signInToken = !!localStorage.getItem("SignInByIdenediToken") ? localStorage.getItem("SignInByIdenediToken") : null;
        if (addon && (addon.AccessToken || signInToken)) {
          let accessToken:string = addon.AccessToken ? addon.AccessToken : localStorage.getItem("SignInByIdenediToken");
          if(addon.Type == AuthType.Technadopt){
            accessToken = addon.technadoptAuthData ? addon.technadoptAuthData.accessToken : accessToken
          }
          changedReq = this.appendAccessToken(request, accessToken);
          if (
            [
              AuthType.ESP,
              AuthType.Technadopt,
              AuthType.SimpleStrata,
              AuthType.Stemexe,
              AuthType.OppPro,
            ].includes(authType)
          ) {
            this.appendBaseUrl(changedReq, addon.BaseUrl);
          }
        } else if(authType == AuthType.ESP && addon && !addon.AccessToken){
          this.appendBaseUrl(changedReq, addon.BaseUrl);
        }
        return this.nextHandler(next, changedReq);
      })
    );
  }

  private appendAccessToken(
    request: HttpRequest<any>,
    token: string
  ): HttpRequest<any> {
    return request.clone({
      headers: request.headers
        .append("Authorization", "Bearer " + token)
        .delete(AUTH_TYPE_HEADER),
    });
  }

  private appendBaseUrl(request: any, baseUrl: string): void {
    request.url = baseUrl + request.url;
    request.urlWithParams = baseUrl + request.urlWithParams;
  }

  private nextHandler(
    next: HttpHandler,
    request: HttpRequest<unknown>
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error("Unauthorized request");
        }
        return throwError(error);
      })
    );
  }
}
