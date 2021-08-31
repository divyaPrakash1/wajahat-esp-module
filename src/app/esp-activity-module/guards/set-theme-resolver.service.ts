import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
//import {AppAppearanceService, ColorTheme} from '../services/app-appearance.service';
import {Observable, of} from 'rxjs';
//import {AuthService} from '../services/auth.service';
import {map} from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';
import { AppAppearanceService, ColorTheme } from '../services/app-appearance.service';
//import {environment} from '../../../src/environments/environment';

@Injectable({providedIn: 'root'})
export class SetThemeResolverService implements Resolve<Observable<any>> {
  constructor(private appAppearanceService: AppAppearanceService, private auth: AuthService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ColorTheme> {
    if (!environment.enableThemes) {
      return of(ColorTheme.DefaultGreen);
    }
    return this.appAppearanceService.getAppAppearanceData(this.auth.idenediGroupId).pipe(
      map((appAppearance) => {
        const theme = appAppearance?.theme || ColorTheme.DefaultGreen;
        this.appAppearanceService.setColorTheme(theme);
        return theme;
      })
    );
  }
}
