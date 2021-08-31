import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { catchError} from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const headers: any = this.getAllHeaders(request);
    let isFileServer = false;
    let withoutAuth = false;
    if (request.url.includes('exceedfileserver.azurewebsites')){
      isFileServer = true;
    }
    if (request.url.includes('idenedi.') || request.url.includes('simplestrata.') || request.url.includes('esp.exceeders.com')){
      withoutAuth = true;
    }
    if ((!headers['Content-Type'] || headers['Content-Type'] === '') && !isFileServer && !withoutAuth){
      Object.assign(headers, {'Content-Type': 'application/json'});
    }
    if (this.authService.isLoggedIn && !isFileServer && !withoutAuth){
      headers.Authorization =  'Bearer ' + this.authService.token;
    }
    else if (isFileServer){
      headers.Authorization =  'Bearer ' + this.authService.FileServerToken;
    }

    request = request.clone({headers: new HttpHeaders(headers)});
    return next.handle(request).pipe(
      catchError((event: HttpResponse<any>) => {
        if (event.status === 401 && !isFileServer && !withoutAuth) {
          // 401 handled in auth.interceptor
          this.authService.logout();
          this.router.navigate(['auth/login']);
        }
        else if (event.status === 401 && isFileServer && !withoutAuth){
          this.authService.getFileToken();
          setTimeout((e: any) => {
            next.handle(request);
          }, 1000);
        }
        return throwError(event);
      })
    );
  }

  getAllHeaders(request: HttpRequest<any>): object{
    const keys = request.headers.keys();
    const result: any = {};
    keys.forEach( (k: any) => {
      result[k] = request.headers.get(k);
    });
    return result;
  }
}
