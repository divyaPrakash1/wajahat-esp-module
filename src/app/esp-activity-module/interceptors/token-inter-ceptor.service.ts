import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor } from '@angular/common/http';
import { EspAuthService } from '../services/esp-auth.service';

@Injectable({
  providedIn: 'root'
})
export class TokenInterCeptorService implements HttpInterceptor {

  constructor(private injector: Injector) { }

  intercept(req, next) {
    let authService = this.injector.get(EspAuthService);
    let token = !!localStorage.getItem('idenedi.auth.token');
    let tokkennizReq = req.clone({
      setHeaders : {
        Authorization: `Bearer ${authService.getToken()}`
      }
      //headers: req.headers.set('Authorization', token)
    });
    return next.handle(tokkennizReq);
  }
}
