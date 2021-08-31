import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {Observable, of} from 'rxjs';
import {first, map} from 'rxjs/operators';
import { AuthService } from './auth.service';
import { SigninProposeComponent } from '../components/signin-propose/signin-propose.component';

const REDIRECT_PATH_STORAGE_KEY = 'login.redirect.path';

@Injectable({
  providedIn: 'root'
})
export class SignInProposeService {

  constructor(
    private authService: AuthService,
    private matDialog: MatDialog,
    private router: Router
  ) {
  }

  showSignInProposal(redirectPath?: string): Observable<boolean> {
    if (this.authService.isLoggedIn()) {
      return of(false);
    }
    const dialogRef = this.matDialog.open(SigninProposeComponent,
      {
        autoFocus: false,
        panelClass: 'signin-propose-dialog'
      });
    return dialogRef.afterClosed().pipe(
      first(),
      map(result => {
        if (result) {
          if (redirectPath) {
            sessionStorage.setItem(REDIRECT_PATH_STORAGE_KEY, redirectPath);
          }
          this.router.navigate([result]);
          return true;
        }
        return false;
      })
    );
  }

  restoreRedirectPath(): any {
    const rPath = sessionStorage.getItem(REDIRECT_PATH_STORAGE_KEY);
    if (rPath) {
      sessionStorage.removeItem(REDIRECT_PATH_STORAGE_KEY);
      return rPath;
    }
  }

}
