import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { LocalEnum } from  '../enums/localstorage'

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private http: HttpClient) {}

  get isLoggedIn(): boolean{
    const local = localStorage.getItem(LocalEnum.isloggedin);
    return local === 'true' ? true : false;
  }
  set isLoggedIn(loggedin: boolean){
    localStorage.setItem(LocalEnum.isloggedin, loggedin.toString());
  }

  get token(): string | null{
    return localStorage.getItem(LocalEnum.token);
  }
  set token(r: string | null){
    localStorage.setItem(LocalEnum.token, r ? r : '');
  }
  get FileServerToken(): string | null{
    return localStorage.getItem(LocalEnum.fileToken);
  }
  set FileServerToken(r: string | null){
    localStorage.setItem(LocalEnum.fileToken, r ? r : '');
  }

  get userId(): number{
    let user: any = localStorage.getItem(LocalEnum.user);
    if (user !== null && user !== undefined){
      user = JSON.parse(user);
    }
    return user ? parseInt(user.userId, 10) : 0;
  }
  get isAdmin(): boolean{
    let user: any = localStorage.getItem(LocalEnum.user);
    if (user !== null && user !== undefined){
      user = JSON.parse(user);
    }
    return user ? user.userIsAdmin : false;
  }
  get organizationId(): number{
    let user: any = localStorage.getItem(LocalEnum.user);
    if (user !== null && user !== undefined){
      user = JSON.parse(user);
    }
    return user ? parseInt(user.organizationId, 10) : 0;
  }
  get userName(): string{
    let user: any = localStorage.getItem(LocalEnum.user);
    if (user !== null && user !== undefined){
      user = JSON.parse(user);
    }
    return user ? (user.firstName + ' ' + user.lastName) : '';
  }
  get idenediToken(): string{
    let user: any = localStorage.getItem(LocalEnum.user);
    if (user !== null && user !== undefined){
      user = JSON.parse(user);
    }
    return user ? user.idenedi_AccessToken : '';
  }

  getFileToken(): any {
    const data = {
      api_key: environment.file.apiKey,
      client_id: environment.file.clientID,
      client_secret: environment.file.clientSecret
    };
    const httpPost = this.http.post(environment.file.api + '/api/token', data);
    httpPost.subscribe((token: any) => {
      localStorage.setItem(LocalEnum.fileToken, token.token);
    })
    return httpPost;
  }

  login(): Observable<boolean> {
    return of(true).pipe(
      delay(1000),
      tap(val => this.isLoggedIn = true)
    );
  }

  logout(): void {
    localStorage.removeItem(LocalEnum.token);
    localStorage.removeItem(LocalEnum.isloggedin);
    this.isLoggedIn = false;
  }
}
