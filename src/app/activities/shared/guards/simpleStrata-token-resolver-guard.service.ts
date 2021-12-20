import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
// import { SimplestrataAuthService } from '../services/simplestrata-auth-activity.service';
// import { ActivityAuthService, AuthType } from '../services/auth-activity.service';
import { Addon } from '../models/addon.model-activity';
import { SimplestrataAuthService } from 'src/app/shared/services/simplestrata-auth.service';
import { AuthService, AuthType } from 'src/app/shared/services/auth.service';
// import { SimplestrataAuthService } from '../services/simplestrata-auth.service';
// import { Addon } from '../models/addon.model';
// import { AuthService, AuthType } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class simpleStrataTokenResolverGuard implements Resolve<any> {
  constructor(
    // private auth: ActivityAuthService, 
    private auth: AuthService, 
    private router: Router,
    private _simplestrataAuthService:SimplestrataAuthService
    ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    if(environment.enableGroupsSelection){  //In case of StemeXe
      return this.auth.getAuthAddonByType(AuthType.SimpleStrata).pipe(
        switchMap(
          (simpleStartaAddon: Addon) => { 
              return !!simpleStartaAddon ? this._simplestrataAuthService
              .getSimpleStrataToken() : of(null) ;
          }
        )
      )
    } else{ //In case of Exceeders
      return of(null) 
    }
  }
}
