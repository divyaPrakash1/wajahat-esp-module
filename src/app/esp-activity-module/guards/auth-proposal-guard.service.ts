import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import { SignInProposeService } from '../services/signin-propose.service';

@Injectable({providedIn: 'root'})
export class AuthProposalGuard implements CanActivate {
  constructor(private auth: AuthService, private signInProposeService: SignInProposeService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    if (this.auth.isLoggedIn()) {
      return of(true);
    }
    return this.signInProposeService.showSignInProposal(state.url).pipe(
      switchMap(() => of(false))
    );
  }
}
